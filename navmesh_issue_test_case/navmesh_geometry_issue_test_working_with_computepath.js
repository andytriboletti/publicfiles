#!/usr/bin/env node

/**
 * NavMesh Geometry Issue Test for recast-navigation
 *
 * This test isolates a critical polygon connectivity issue where NavMesh generation
 * creates isolated polygon islands instead of connected walkable areas.
 *
 * ISSUE SUMMARY:
 * - Even with minimal geometry (2x2 plane), NavMesh creates isolated polygons
 * - All connectivity tests fail with DT_FAILURE (-2147483640)
 * - Issue persists regardless of parameters (walkableRadius, simplification, etc.)
 * - Problem appears to be in geometry conversion or NavMesh generation algorithm
 *
 * ENVIRONMENT:
 * - @recast-navigation/core: ^0.39.0
 * - @recast-navigation/three: ^0.39.0
 * - three: ^0.172.0
 * - Node.js: Latest
 *
 * REPRODUCTION:
 * 1. Create simple subdivided plane geometry
 * 2. Generate NavMesh using threeToSoloNavMesh
 * 3. Test polygon connectivity with findPath
 * 4. Observe isolated polygons instead of connected areas
 */

import { init, NavMeshQuery, QueryFilter, statusToReadableString } from '@recast-navigation/core';
import { threeToSoloNavMesh, getPositionsAndIndices } from '@recast-navigation/three';
import { PlaneGeometry, Mesh, MeshStandardMaterial, Color, Vector3 } from 'three';

// Test configurations to isolate the issue
const TEST_CONFIGS = [
  {
    name: "Minimal 2x2 Plane",
    geometry: { size: 10, subdivisions: 2 },
    config: {
      cs: 0.5,
      ch: 0.2,
      walkableSlopeAngle: 30,
      walkableHeight: 2,
      walkableClimb: 0.5,
      walkableRadius: 0.1,
      maxEdgeLen: 0,
      maxSimplificationError: 0,
      minRegionArea: 0,
      mergeRegionArea: 0,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1,
      walkableFlags: 1,
      walkableArea: 0
    }
  },
  {
    name: "Standard Parameters",
    geometry: { size: 10, subdivisions: 5 },
    config: {
      cs: 0.5,
      ch: 0.2,
      walkableSlopeAngle: 30,
      walkableHeight: 2,
      walkableClimb: 0.5,
      walkableRadius: 0.5,
      maxEdgeLen: 12,
      maxSimplificationError: 1.3,
      minRegionArea: 8,
      mergeRegionArea: 20,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1,
      walkableFlags: 1,
      walkableArea: 0
    }
  },
  {
    name: "Example Pattern (getPositionsAndIndices + computePath)",
    geometry: { size: 10, subdivisions: 5 },
    useExamplePattern: true,
    config: {
      cs: 0.05,
      ch: 0.2,
      walkableSlopeAngle: 30,
      walkableHeight: 2,
      walkableClimb: 0.5,
      walkableRadius: 0.5,
      maxEdgeLen: 12,
      maxSimplificationError: 1.3,
      minRegionArea: 8,
      mergeRegionArea: 20,
      maxVertsPerPoly: 6,
      detailSampleDist: 6,
      detailSampleMaxError: 1,
      walkableFlags: 1,
      walkableArea: 0
    }
  }
];

/**
 * Generate NavMesh using the example pattern (getPositionsAndIndices)
 */
function generateNavMeshExamplePattern(meshes, config) {
  console.log('Using example pattern: getPositionsAndIndices + threeToSoloNavMesh');

  // Extract positions and indices using the example's approach
  const [positions, indices] = getPositionsAndIndices(meshes);

  console.log(`Extracted geometry:`, {
    positions: positions.length,
    indices: indices.length,
    triangles: indices.length / 3
  });

  // Generate NavMesh using the extracted data
  const result = threeToSoloNavMesh(meshes, config);

  return result;
}

/**
 * Create a Three.js mesh for testing
 */
function createTestMesh(size, subdivisions) {
  console.log(`Creating ${subdivisions}x${subdivisions} subdivided plane (${size}x${size})`);

  // Create subdivided plane geometry
  const geometry = new PlaneGeometry(size, size, subdivisions, subdivisions);
  geometry.rotateX(-Math.PI / 2); // Make horizontal

  // Add vertex colors to mark walkable areas
  const colors = [];
  const walkableColor = new Color(0xffffff); // White = walkable
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    colors.push(walkableColor.r, walkableColor.g, walkableColor.b);
  }
  geometry.setAttribute('color', new Float32Array(colors));

  // Create material
  const material = new MeshStandardMaterial({
    color: 0x808080,
    vertexColors: true
  });

  // Create mesh
  const mesh = new Mesh(geometry, material);
  mesh.position.set(0, 0, 0);

  // Mark as walkable
  mesh.userData = {
    walkable: true,
    area: 0
  };

  console.log(`Created mesh:`, {
    vertices: geometry.attributes.position.count,
    triangles: geometry.index ? geometry.index.count / 3 : (geometry.attributes.position.count / 3),
    hasColors: !!geometry.attributes.color,
    userData: mesh.userData
  });

  return mesh;
}

/**
 * Test polygon connectivity
 */
function testConnectivity(navMeshQuery, testName, useComputePath = false) {
  console.log(`\n=== ${testName} - Connectivity Test ===`);

  // Test points within the geometry bounds
  const testPoints = [
    new Vector3(0, 0.1, 0),      // Center
    new Vector3(2, 0.1, 2),      // Corner 1
    new Vector3(-2, 0.1, 2),     // Corner 2
    new Vector3(2, 0.1, -2),     // Corner 3
    new Vector3(-2, 0.1, -2),    // Corner 4
  ];

  // Find polygons for each test point
  const polygons = [];
  for (let i = 0; i < testPoints.length; i++) {
    const point = testPoints[i];
    const result = navMeshQuery.findNearestPoly(point, [1, 1, 1]);

    console.log(`Point ${i} (${point.x}, ${point.y}, ${point.z}):`, {
      success: result.success,
      status: result.status,
      statusString: statusToReadableString(result.status),
      nearestRef: result.nearestRef,
      isOverPoly: result.isOverPoly
    });

    if (result.success) {
      polygons.push({ point, ref: result.nearestRef });
    }
  }

  // Test connectivity between polygons
  let successfulPaths = 0;
  let totalTests = 0;
  const failedPaths = [];

  for (let i = 0; i < polygons.length; i++) {
    for (let j = i + 1; j < polygons.length; j++) {
      const start = polygons[i];
      const end = polygons[j];
      totalTests++;

      let pathResult;

      if (useComputePath && typeof navMeshQuery.computePath === 'function') {
        // Use the example's computePath approach
        try {
          const filter = new QueryFilter();
          filter.includeFlags = 1; // PolyFlags.WALK equivalent

          const result = navMeshQuery.computePath(
            { x: start.point.x, y: start.point.y, z: start.point.z },
            { x: end.point.x, y: end.point.y, z: end.point.z },
            { filter }
          );

          pathResult = {
            success: result.path && result.path.length > 0,
            status: result.path ? 1073741824 : -2147483640, // DT_SUCCESS or DT_FAILURE
            path: result.path
          };

          console.log(`    computePath result:`, {
            pathLength: result.path ? result.path.length : 0,
            success: pathResult.success
          });

        } catch (computePathError) {
          console.log(`    computePath error: ${computePathError.message}`);
          pathResult = { success: false, status: -2147483640 };
        }
      } else {
        // Use traditional findPath approach
        pathResult = navMeshQuery.findPath(
          start.ref,
          end.ref,
          [start.point.x, start.point.y, start.point.z],
          [end.point.x, end.point.y, end.point.z]
        );

        // If basic approach fails, try with QueryFilter
        if (!pathResult.success) {
          try {
            const filter = new QueryFilter();
            pathResult = navMeshQuery.findPath(
              start.ref,
              end.ref,
              [start.point.x, start.point.y, start.point.z],
              [end.point.x, end.point.y, end.point.z],
              { filter: filter }
            );
          } catch (explicitFilterError) {
            console.log(`    findPath API Error: ${explicitFilterError.message}`);
          }
        }
      }

      if (pathResult.success) {
        successfulPaths++;
      } else {
        failedPaths.push({
          start: start.point,
          end: end.point,
          startPoly: start.ref,
          endPoly: end.ref,
          status: pathResult.status,
          statusString: statusToReadableString(pathResult.status)
        });
      }
    }
  }

  const connectivityScore = totalTests > 0 ? (successfulPaths / totalTests * 100) : 0;

  console.log(`\nConnectivity Results:`);
  console.log(`- Successful paths: ${successfulPaths}/${totalTests}`);
  console.log(`- Connectivity score: ${connectivityScore.toFixed(1)}%`);
  console.log(`- Unique polygons: ${polygons.length}`);
  console.log(`- Failed paths: ${failedPaths.length}`);

  if (failedPaths.length > 0) {
    console.log(`\nFirst 3 failed paths:`);
    failedPaths.slice(0, 3).forEach((failure, index) => {
      console.log(`  ${index + 1}. (${failure.start.x}, ${failure.start.z}) -> (${failure.end.x}, ${failure.end.z})`);
      console.log(`     Status: ${failure.status} (${failure.statusString})`);
      console.log(`     Polygons: ${failure.startPoly} -> ${failure.endPoly}`);
    });
  }

  return {
    connectivityScore,
    successfulPaths,
    totalTests,
    uniquePolygons: polygons.length,
    failedPaths: failedPaths.length
  };
}

/**
 * Main test function
 */
async function runGeometryTest() {
  try {
    console.log('=== NavMesh Geometry Issue Test ===');
    console.log('Testing polygon connectivity with different configurations\n');

    // Initialize recast-navigation
    await init();
    console.log('✅ Recast-navigation initialized\n');

    const results = [];

    // Test each configuration
    for (const testConfig of TEST_CONFIGS) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`TEST: ${testConfig.name}`);
      console.log(`${'='.repeat(60)}`);

      // Create test mesh
      const mesh = createTestMesh(
        testConfig.geometry.size,
        testConfig.geometry.subdivisions
      );

      console.log(`\nNavMesh Configuration:`);
      console.log(JSON.stringify(testConfig.config, null, 2));

      // Generate NavMesh
      console.log(`\nGenerating NavMesh...`);
      const startTime = Date.now();

      let result;
      if (testConfig.useExamplePattern) {
        result = generateNavMeshExamplePattern([mesh], testConfig.config);
      } else {
        result = threeToSoloNavMesh([mesh], testConfig.config);
      }

      const elapsedTime = Date.now() - startTime;

      console.log(`NavMesh generation completed in ${elapsedTime}ms`);
      console.log(`Success: ${result.success}`);

      if (!result.success) {
        console.error(`❌ NavMesh generation failed for ${testConfig.name}`);
        if (result.error) {
          console.error(`Error:`, result.error);
        }
        continue;
      }

      // Create NavMeshQuery
      const navMeshQuery = new NavMeshQuery(result.navMesh);
      console.log(`✅ NavMeshQuery created successfully`);

      // Test connectivity
      const connectivityResult = testConnectivity(
        navMeshQuery,
        testConfig.name,
        testConfig.useExamplePattern
      );

      results.push({
        testName: testConfig.name,
        geometry: testConfig.geometry,
        config: testConfig.config,
        generationTime: elapsedTime,
        ...connectivityResult
      });
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SUMMARY`);
    console.log(`${'='.repeat(60)}`);

    results.forEach(result => {
      console.log(`\n${result.testName}:`);
      console.log(`  Geometry: ${result.geometry.subdivisions}x${result.geometry.subdivisions} plane`);
      console.log(`  Connectivity: ${result.connectivityScore.toFixed(1)}%`);
      console.log(`  Polygons: ${result.uniquePolygons}`);
      console.log(`  Successful paths: ${result.successfulPaths}/${result.totalTests}`);
      console.log(`  Generation time: ${result.generationTime}ms`);
    });

    // Issue analysis
    const hasConnectivityIssue = results.every(r => r.connectivityScore === 0);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`ISSUE ANALYSIS`);
    console.log(`${'='.repeat(60)}`);

    if (hasConnectivityIssue) {
      console.log(`❌ CONFIRMED: Polygon connectivity issue detected!`);
      console.log(`   - All tests show 0% connectivity`);
      console.log(`   - NavMesh creates isolated polygon islands`);
      console.log(`   - Issue persists across different parameters`);
      console.log(`   - Likely geometry conversion or algorithm issue`);
    } else {
      console.log(`✅ No connectivity issues detected`);
    }

    console.log(`\nEnvironment:`);
    console.log(`  - @recast-navigation/core: ^0.39.0`);
    console.log(`  - @recast-navigation/three: ^0.39.0`);
    console.log(`  - three: ^0.172.0`);
    console.log(`  - Node.js: ${process.version}`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
runGeometryTest();
