#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Running NavMesh geometry issue test..."
node navmesh_geometry_issue_test.js
