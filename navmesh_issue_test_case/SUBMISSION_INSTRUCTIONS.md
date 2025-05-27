# NavMesh Issue Submission Instructions

## Quick Test
```bash
chmod +x run_test.sh
./run_test.sh
```

## Manual Test
```bash
npm install
node navmesh_geometry_issue_test.js
```

## Files Included

- `navmesh_geometry_issue_test.js` - Standalone test that reproduces the issue
- `package.json` - Dependencies for the test
- `README.md` - Detailed issue documentation
- `GITHUB_ISSUE_TEMPLATE.md` - Ready-to-paste GitHub issue
- `run_test.sh` - Quick test runner

## GitHub Submission

1. Create a new issue at: https://github.com/isaac-mason/recast-navigation-js/issues
2. Copy the content from `GITHUB_ISSUE_TEMPLATE.md`
3. Attach this test case as a zip file or reference the files

## Expected Output

The test should show 0% connectivity and DT_INVALID_PARAM errors, confirming the issue.
