#!/bin/bash

#Default the database name if no arg is supplied.
#Not sure if below is correct since database should be prisma/dev.db
devdb=${1:-./dev.db}

#Write the name of the database to the environment
echo "DATABASE_URL=\"file:$devdb\"" >>  .env

#Write the session secret to the environment
echo "SESSION_SECRET=\"top-secret\"" >> .env

#Run the install project dependencies.
npm install

# Use the latest schema.
# Consider npx prisma db push --force-reset to create/re-create dev.db from scratch.
npx prisma db push schema/upgrade 

if [ -f $devdb ]; then
  # Add some mock/initial data to the database.
  npx prisma db seed
fi 

# Startup nodejs.
npm run dev

