# SEE-Tool
Surrogate EHR Environment

# Dependencies
* Linux (recommended for production installation)
* Node.JS 0.10.25
* MongoDB 2.6.1
* Firefox

# Installation
For detailed installation instructions, see [SEE Installation Guide.docx](SEE%20Installation%20Guide.docx)

1. From the SEE directory, perform the following: 
2. npm install
2. Configure database in config/default.js
3. Load system users with "node ./Data/systemDataLoader.js"
4. Import seed data into database: "./bin/mongoimport --db medication --collection medication --host <HOST> --port <PORT> --file <SEE LOCATION>/Data/medications.js --jsonArray --stopOnError --drop --username see_user --password <PASSWORD>"
5. Load client data: "node ./Data/clientDataLoader-dev.js"
6. For integration with Orion, update configuration in utils/orionconfig.json
7. Start the SEE server with either "node documentService.js" or "npm start"

> Note: Other branches include tools, the CDA implementation guide(s), and code generated utilities 