# NavMesh findPath fails with DT_INVALID_PARAM even on same polygon

## Bug Description

`findPath` calls consistently fail with status `-2147483640` (`DT_INVALID_PARAM`) even when start and end points are on the same polygon, making pathfinding completely non-functional.

## Environment

- `@recast-navigation/core`: ^0.39.0
- `@recast-navigation/three`: ^0.39.0  
- `three`: ^0.172.0
- Node.js: v23.11.0

## Minimal Reproduction

I've created a standalone test case that reproduces this issue:

```javascript
import { init, NavMeshQuery, QueryFilter, statusToReadableString } from '@recast-navigation/core';
import { threeToSoloNavMesh } from '@recast-navigation/three';
import { PlaneGeometry, Mesh, MeshStandardMaterial, Color, Vector3 } from 'three';

async function reproduceIssue() {
  await init();
  
  // Create simple 2x2 subdivided plane
  const geometry = new PlaneGeometry(10, 10, 2, 2);
  geometry.rotateX(-Math.PI / 2);
  
  // Add vertex colors
  const colors = [];
  const walkableColor = new Color(0xffffff);
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    colors.push(walkableColor.r, walkableColor.g, walkableColor.b);
  }
  geometry.setAttribute('color', new Float32Array(colors));
  
  const material = new MeshStandardMaterial({ vertexColors: true });
  const mesh = new Mesh(geometry, material);
  mesh.userData = { walkable: true, area: 0 };
  
  // Generate NavMesh
  const result = threeToSoloNavMesh([mesh], {
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
  });
  
  if (!result.success) {
    console.error('NavMesh generation failed');
    return;
  }
  
  const navMeshQuery = new NavMeshQuery(result.navMesh);
  
  // Test points
  const start = new Vector3(0, 0.1, 0);
  const end = new Vector3(2, 0.1, 2);
  
  const startResult = navMeshQuery.findNearestPoly(start, [1, 1, 1]);
  const endResult = navMeshQuery.findNearestPoly(end, [1, 1, 1]);
  
  console.log('Start polygon:', startResult); // success: true, nearestRef: 1
  console.log('End polygon:', endResult);     // success: true, nearestRef: 1
  
  // This fails even though both points are on the same polygon
  const pathResult = navMeshQuery.findPath(
    startResult.nearestRef,
    endResult.nearestRef,
    [start.x, start.y, start.z],
    [end.x, end.y, end.z]
  );
  
  console.log('Path result:', pathResult);
  // Output: { success: false, status: -2147483640 } (DT_INVALID_PARAM)
}

reproduceIssue();
```

## Expected Behavior

- `findPath` should succeed when called with valid polygon references
- Should work especially when start and end points are on the same polygon
- Should return a valid path or at minimum not fail with `DT_INVALID_PARAM`

## Actual Behavior

- All `findPath` calls fail with status `-2147483640` (`DT_INVALID_PARAM`)
- Issue occurs even when start and end points are on the same polygon
- 0% connectivity across all test scenarios

## Investigation Results

I've systematically tested:

- ✅ **Different parameters**: Minimal and standard NavMesh configurations
- ✅ **Different geometry**: From simple 2x2 planes to complex subdivided meshes  
- ✅ **API variations**: With and without QueryFilter parameters
- ✅ **Simplification disabled**: All simplification parameters set to 0
- ✅ **Monolithic NavMesh**: Non-tiled generation approach

The issue persists across all variations.

## Additional Context

This might be related to the previous `findNearestPoly` issue where you suggested omitting the QueryFilter parameter. I've tested `findPath` both with and without QueryFilter with the same results.

The `findNearestPoly` calls work correctly and return valid polygon references, but `findPath` consistently fails even with those valid references.

## Test Files

I can provide a complete standalone test case if helpful. The issue is reproducible with minimal geometry and standard library usage.

## Request

Could you help identify:
1. If this is a known issue with version 0.39.0?
2. Whether there's a correct `findPath` API usage pattern I'm missing?
3. If this indicates a bug in the library?

This is blocking pathfinding functionality in our application. Any guidance would be greatly appreciated!

## Workaround Attempts

- Tried different `findPath` parameter combinations
- Tested with explicit QueryFilter objects
- Attempted with different polygon reference formats
- Verified NavMesh generation success before calling `findPath`

None of these approaches resolved the issue.
