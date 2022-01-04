#!/bin/bash

#Default the database name if no arg is supplied.
devdb=${1:-./dev.db}

#Write the name of the database to the environment
echo "DATABASE_URL=\"file:$devdb\"" >>  .env

#Run the install project dependencies.
npm install

# Use the latest schema.
npx prisma db push schema/upgrade 

if [ -f $devdb ]; then
  # Add some mock/initial data to the database.
  npx prisma db seed
fi 

# Startup nodejs.
npm run dev

