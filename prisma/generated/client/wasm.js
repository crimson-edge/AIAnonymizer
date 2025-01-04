
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
  emailVerified: 'emailVerified',
  verificationToken: 'verificationToken',
  resetToken: 'resetToken',
  resetTokenExpiry: 'resetTokenExpiry',
  isAdmin: 'isAdmin',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  stripeCustomerId: 'stripeCustomerId',
  stripePriceId: 'stripePriceId'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tier: 'tier',
  monthlyLimit: 'monthlyLimit',
  tokenLimit: 'tokenLimit',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  stripeCustomerId: 'stripeCustomerId',
  stripeSubscriptionId: 'stripeSubscriptionId',
  stripePriceId: 'stripePriceId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GroqKeyScalarFieldEnum = {
  id: 'id',
  key: 'key',
  isInUse: 'isInUse',
  currentSession: 'currentSession',
  lastUsed: 'lastUsed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApiKeyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  key: 'key',
  name: 'name',
  lastUsed: 'lastUsed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isActive: 'isActive'
};

exports.Prisma.GroqKeyPoolScalarFieldEnum = {
  id: 'id',
  apiKey: 'apiKey',
  isActive: 'isActive',
  usageCount: 'usageCount',
  lastUsed: 'lastUsed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UsageScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokens: 'tokens',
  createdAt: 'createdAt',
  type: 'type',
  cost: 'cost'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED'
};

exports.SubscriptionTier = exports.$Enums.SubscriptionTier = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM'
};

exports.Prisma.ModelName = {
  User: 'User',
  Subscription: 'Subscription',
  GroqKey: 'GroqKey',
  ApiKey: 'ApiKey',
  GroqKeyPool: 'GroqKeyPool',
  Usage: 'Usage'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/walterrines/CascadeProjects/aianonymizer/prisma/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "/Users/walterrines/CascadeProjects/aianonymizer/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../..",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  previewFeatures = [\"driverAdapters\"]\n  output          = \"./generated/client\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id                String        @id @default(cuid())\n  firstName         String\n  lastName          String\n  email             String        @unique\n  password          String\n  emailVerified     DateTime?\n  verificationToken String?       @unique\n  resetToken        String?       @unique\n  resetTokenExpiry  DateTime?\n  isAdmin           Boolean       @default(false)\n  status            UserStatus    @default(ACTIVE)\n  apiKeys           ApiKey[]\n  subscription      Subscription?\n  Usage             Usage[]\n  createdAt         DateTime      @default(now())\n  updatedAt         DateTime      @updatedAt\n  stripeCustomerId  String?\n  stripePriceId     String?\n}\n\nmodel Subscription {\n  id                   String           @id @default(cuid())\n  userId               String           @unique\n  tier                 SubscriptionTier @default(FREE)\n  monthlyLimit         Int              @default(1000)\n  tokenLimit           Int              @default(1000) // Current token limit including overage purchases\n  startDate            DateTime         @default(now())\n  endDate              DateTime?\n  isActive             Boolean          @default(true)\n  stripeCustomerId     String?          @unique\n  stripeSubscriptionId String?          @unique\n  stripePriceId        String?\n  createdAt            DateTime         @default(now())\n  updatedAt            DateTime         @updatedAt\n  user                 User             @relation(fields: [userId], references: [id])\n}\n\nmodel GroqKey {\n  id             String    @id @default(cuid())\n  key            String    @unique\n  isInUse        Boolean   @default(false)\n  currentSession String?\n  lastUsed       DateTime?\n  createdAt      DateTime  @default(now())\n  updatedAt      DateTime  @updatedAt\n\n  @@index([currentSession])\n  @@index([isInUse])\n}\n\nmodel ApiKey {\n  id        String    @id @default(cuid())\n  userId    String\n  key       String    @unique\n  name      String?\n  lastUsed  DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime\n  isActive  Boolean   @default(true)\n  user      User      @relation(fields: [userId], references: [id])\n}\n\nmodel GroqKeyPool {\n  id         String   @id\n  apiKey     String   @unique\n  isActive   Boolean  @default(true)\n  usageCount Int      @default(0)\n  lastUsed   DateTime @default(now())\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime\n}\n\nmodel Usage {\n  id        String   @id\n  userId    String\n  tokens    Int\n  createdAt DateTime @default(now())\n  type      String\n  cost      Float\n  User      User     @relation(fields: [userId], references: [id])\n}\n\nenum SubscriptionTier {\n  FREE\n  BASIC\n  PREMIUM\n}\n\nenum UserStatus {\n  ACTIVE\n  SUSPENDED\n}\n",
  "inlineSchemaHash": "68ea8f8c887b20456e014bea47a3a644c50c69a28d8aafe92d51bc340171e864",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"firstName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"verificationToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"resetToken\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"resetTokenExpiry\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"isAdmin\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"UserStatus\"},{\"name\":\"apiKeys\",\"kind\":\"object\",\"type\":\"ApiKey\",\"relationName\":\"ApiKeyToUser\"},{\"name\":\"subscription\",\"kind\":\"object\",\"type\":\"Subscription\",\"relationName\":\"SubscriptionToUser\"},{\"name\":\"Usage\",\"kind\":\"object\",\"type\":\"Usage\",\"relationName\":\"UsageToUser\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"stripeCustomerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stripePriceId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Subscription\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tier\",\"kind\":\"enum\",\"type\":\"SubscriptionTier\"},{\"name\":\"monthlyLimit\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"tokenLimit\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"startDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"stripeCustomerId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stripeSubscriptionId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stripePriceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"SubscriptionToUser\"}],\"dbName\":null},\"GroqKey\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"key\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isInUse\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"currentSession\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastUsed\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"ApiKey\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"key\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastUsed\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"ApiKeyToUser\"}],\"dbName\":null},\"GroqKeyPool\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"apiKey\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isActive\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"usageCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"lastUsed\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Usage\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tokens\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"cost\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"User\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"UsageToUser\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

