#! /bin/bash

# build react code
cd frontend/
yarn build
cd ../

# build backend server
cd backend/
python -m PyInstaller server.spec --noconfirm
cd ../

# move builds to root directory
mv backend/dist/server/ ./
mkdir -p server/static
mv frontend/build/static/css/ server/static/
mv frontend/build/static/js/ server/static/
mv frontend/build/index.html server/static/
mv frontend/build/favicon.ico server/static/
rm server/db.sqlite3

# build electron application
yarn dist

#cleanup
rm -rf backend/build/
rm -rf backend/dist/
rm -rf frontend/build/
rm -rf server/
