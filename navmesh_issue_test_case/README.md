# NavMesh Polygon Connectivity Issue - Test Case

## Issue Summary

This test case demonstrates a critical polygon connectivity issue in `@recast-navigation/three` where NavMesh generation creates isolated polygon islands instead of connected walkable areas, causing all pathfinding to fail with `DT_INVALID_PARAM` errors.

## Problem Description

- **Issue**: `findPath` calls fail with status `-2147483640` (`DT_INVALID_PARAM`) even when start and end points are on the same polygon
- **Scope**: Affects all geometry types (simple planes, subdivided meshes, complex scenes)
- **Impact**: Makes pathfinding completely non-functional
- **Persistence**: Issue occurs regardless of NavMesh parameters (walkableRadius, simplification settings, etc.)

## Environment

- `@recast-navigation/core`: ^0.39.0
- `@recast-navigation/three`: ^0.39.0  
- `three`: ^0.172.0
- Node.js: v23.11.0

## Reproduction

### Quick Test
```bash
node navmesh_geometry_issue_test.js
```

### Expected vs Actual Results

**Expected**: 
- NavMesh should create connected polygons for simple plane geometry
- `findPath` should succeed between points on the same or connected polygons
- Connectivity score should be > 0%

**Actual**:
- All `findPath` calls fail with `DT_INVALID_PARAM` (-2147483640)
- 0% connectivity across all test configurations
- Issue persists even with minimal 2x2 plane geometry

## Test Results

```
=== SUMMARY ===

Minimal 2x2 Plane:
  Geometry: 2x2 plane
  Connectivity: 0.0%
  Polygons: 5
  Successful paths: 0/10
  Generation time: 8ms

Standard Parameters:
  Geometry: 5x5 plane  
  Connectivity: 0.0%
  Polygons: 5
  Successful paths: 0/10
  Generation time: 1ms

❌ CONFIRMED: Polygon connectivity issue detected!
   - All tests show 0% connectivity
   - NavMesh creates isolated polygon islands
   - Issue persists across different parameters
   - Likely geometry conversion or algorithm issue
```

## Investigation Attempts

We systematically tested multiple approaches:

1. **✅ Parameter Variations**: Tested minimal and standard NavMesh parameters
2. **✅ Geometry Simplification**: Tested from complex (200x200) down to minimal (2x2) subdivision
3. **✅ Simplification Disabled**: Set all simplification parameters to 0
4. **✅ Monolithic vs Tiled**: Tested both NavMesh generation approaches
5. **✅ Building Exclusion**: Tested with ground-only geometry
6. **✅ API Variations**: Tested different `findPath` call patterns

## Key Findings

1. **Same Polygon Failure**: Even when start and end points are on the same polygon (ref: 1 or 4), `findPath` fails
2. **Parameter Independence**: Issue occurs regardless of NavMesh generation parameters
3. **Geometry Independence**: Issue occurs with both simple and complex geometry
4. **API Independence**: Issue occurs with different `findPath` API usage patterns

## Potential Root Causes

1. **Geometry Conversion Issue**: Problem in Three.js to recast-navigation geometry conversion
2. **NavMesh Generation Bug**: Issue in the core NavMesh generation algorithm
3. **API Usage Error**: Incorrect usage of `findPath` API (though we followed examples)
4. **Library Version Compatibility**: Potential compatibility issue between library versions

## Files Included

- `navmesh_geometry_issue_test.js` - Standalone test case that reproduces the issue
- `test_package.json` - Package dependencies for the test
- `README_NAVMESH_ISSUE.md` - This documentation

## Request for Help

This issue is blocking pathfinding functionality in our application. We've exhausted parameter-based solutions and need guidance on:

1. Whether this is a known issue with version 0.39.0
2. If there's a correct way to call `findPath` that we're missing
3. Whether there are geometry format requirements we're not meeting
4. If this is a bug that needs to be fixed in the library

Any assistance would be greatly appreciated!

## Related Issues

This may be related to previous `findNearestPoly` issues where the maintainer suggested omitting the QueryFilter parameter. We've tested both with and without QueryFilter in `findPath` calls with the same results.
