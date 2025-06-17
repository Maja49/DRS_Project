#!/bin/bash
echo "Starting Vite dev server..."
ls -l ./node_modules/.bin/vite || echo "vite not found"
./node_modules/.bin/vite --host
