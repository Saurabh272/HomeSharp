import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  Resource, detectResourcesSync,
  envDetectorSync,
  hostDetectorSync,
  processDetectorSync
} from '@opentelemetry/resources';
import * as opentelemetry from '@opentelemetry/sdk-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  LoggerProvider,
  BatchLogRecordProcessor
} from '@opentelemetry/sdk-logs';

const exporterOptions = {
  url: process.env.TRACER_URL
};

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);

const logExporter = new OTLPLogExporter();

const loggerProvider = new LoggerProvider({
  resource: detectResourcesSync({
    detectors: [envDetectorSync, processDetectorSync, hostDetectorSync]
  })
});

loggerProvider.addLogRecordProcessor(
  new BatchLogRecordProcessor(logExporter)
);

logs.setGlobalLoggerProvider(loggerProvider);

const traceExporter = new OTLPTraceExporter(exporterOptions);
const sdk = new opentelemetry.NodeSDK({
  traceExporter,
  resource: new Resource({
    'service.name': 'homesharp-backend',
    'deployment.environment': process.env.NODE_ENV
  }),
  instrumentations: [new NestInstrumentation(),
    getNodeAutoInstrumentations(
      {
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-connect': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-pg': { enhancedDatabaseReporting: true },
        '@opentelemetry/instrumentation-net': { enabled: false },
        '@opentelemetry/instrumentation-express': { enabled: false }
      }
    ),
    new WinstonInstrumentation()
  ]
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .finally(() => process.exit(0));
});

export {
  sdk
};
