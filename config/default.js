module.exports = {
    Settings: {
        dbHost: "localhost",
        dbPort: 27017,
        appHost: "localhost",
        dbUser: "SOME_USER",
        dbPassword: "SOME_PASSWORD",
        appPort: 8000,
        fileDropLocation: "./drop/send/",
        fileLoadLocation: "./drop/load/",
        fileProcessedDropLocation: "./drop/archive/send/",
        fileProcessedLoadLocation: "./drop/archive/load/",
        fileProcessedErrorLocation: "./drop/archive/error/",
        sampleHeaderLocation: "./drop/",
        logLevel: "verbose", //can be verbose, info, http, warn, error (progressively restrictive)
        logPath: "./see.log",
        inboundLogLevel: "verbose",
        inboundLogPath: "./see-inbound.log"
    }
}

