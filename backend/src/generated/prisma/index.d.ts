
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Category
 * 
 */
export type Category = $Result.DefaultSelection<Prisma.$CategoryPayload>
/**
 * Model IngredientCategory
 * 
 */
export type IngredientCategory = $Result.DefaultSelection<Prisma.$IngredientCategoryPayload>
/**
 * Model UnitOfMeasure
 * 
 */
export type UnitOfMeasure = $Result.DefaultSelection<Prisma.$UnitOfMeasurePayload>
/**
 * Model Ingredient
 * 
 */
export type Ingredient = $Result.DefaultSelection<Prisma.$IngredientPayload>
/**
 * Model Recipe
 * 
 */
export type Recipe = $Result.DefaultSelection<Prisma.$RecipePayload>
/**
 * Model UnitQuantity
 * 
 */
export type UnitQuantity = $Result.DefaultSelection<Prisma.$UnitQuantityPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UnitType: {
  WEIGHT: 'WEIGHT',
  VOLUME: 'VOLUME',
  COUNT: 'COUNT',
  OTHER: 'OTHER'
};

export type UnitType = (typeof UnitType)[keyof typeof UnitType]

}

export type UnitType = $Enums.UnitType

export const UnitType: typeof $Enums.UnitType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Categories
 * const categories = await prisma.category.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Categories
   * const categories = await prisma.category.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.category`: Exposes CRUD operations for the **Category** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Categories
    * const categories = await prisma.category.findMany()
    * ```
    */
  get category(): Prisma.CategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ingredientCategory`: Exposes CRUD operations for the **IngredientCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IngredientCategories
    * const ingredientCategories = await prisma.ingredientCategory.findMany()
    * ```
    */
  get ingredientCategory(): Prisma.IngredientCategoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.unitOfMeasure`: Exposes CRUD operations for the **UnitOfMeasure** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UnitOfMeasures
    * const unitOfMeasures = await prisma.unitOfMeasure.findMany()
    * ```
    */
  get unitOfMeasure(): Prisma.UnitOfMeasureDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ingredient`: Exposes CRUD operations for the **Ingredient** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ingredients
    * const ingredients = await prisma.ingredient.findMany()
    * ```
    */
  get ingredient(): Prisma.IngredientDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.recipe`: Exposes CRUD operations for the **Recipe** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Recipes
    * const recipes = await prisma.recipe.findMany()
    * ```
    */
  get recipe(): Prisma.RecipeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.unitQuantity`: Exposes CRUD operations for the **UnitQuantity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UnitQuantities
    * const unitQuantities = await prisma.unitQuantity.findMany()
    * ```
    */
  get unitQuantity(): Prisma.UnitQuantityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Category: 'Category',
    IngredientCategory: 'IngredientCategory',
    UnitOfMeasure: 'UnitOfMeasure',
    Ingredient: 'Ingredient',
    Recipe: 'Recipe',
    UnitQuantity: 'UnitQuantity',
    User: 'User'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "category" | "ingredientCategory" | "unitOfMeasure" | "ingredient" | "recipe" | "unitQuantity" | "user"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Category: {
        payload: Prisma.$CategoryPayload<ExtArgs>
        fields: Prisma.CategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findFirst: {
            args: Prisma.CategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          findMany: {
            args: Prisma.CategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          create: {
            args: Prisma.CategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          createMany: {
            args: Prisma.CategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          delete: {
            args: Prisma.CategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          update: {
            args: Prisma.CategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          deleteMany: {
            args: Prisma.CategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>[]
          }
          upsert: {
            args: Prisma.CategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CategoryPayload>
          }
          aggregate: {
            args: Prisma.CategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCategory>
          }
          groupBy: {
            args: Prisma.CategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<CategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.CategoryCountArgs<ExtArgs>
            result: $Utils.Optional<CategoryCountAggregateOutputType> | number
          }
        }
      }
      IngredientCategory: {
        payload: Prisma.$IngredientCategoryPayload<ExtArgs>
        fields: Prisma.IngredientCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IngredientCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IngredientCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>
          }
          findFirst: {
            args: Prisma.IngredientCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IngredientCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>
          }
          findMany: {
            args: Prisma.IngredientCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>[]
          }
          create: {
            args: Prisma.IngredientCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>
          }
          createMany: {
            args: Prisma.IngredientCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IngredientCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>[]
          }
          delete: {
            args: Prisma.IngredientCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>
          }
          update: {
            args: Prisma.IngredientCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>
          }
          deleteMany: {
            args: Prisma.IngredientCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IngredientCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IngredientCategoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>[]
          }
          upsert: {
            args: Prisma.IngredientCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientCategoryPayload>
          }
          aggregate: {
            args: Prisma.IngredientCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIngredientCategory>
          }
          groupBy: {
            args: Prisma.IngredientCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<IngredientCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.IngredientCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<IngredientCategoryCountAggregateOutputType> | number
          }
        }
      }
      UnitOfMeasure: {
        payload: Prisma.$UnitOfMeasurePayload<ExtArgs>
        fields: Prisma.UnitOfMeasureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UnitOfMeasureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UnitOfMeasureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>
          }
          findFirst: {
            args: Prisma.UnitOfMeasureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UnitOfMeasureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>
          }
          findMany: {
            args: Prisma.UnitOfMeasureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>[]
          }
          create: {
            args: Prisma.UnitOfMeasureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>
          }
          createMany: {
            args: Prisma.UnitOfMeasureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UnitOfMeasureCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>[]
          }
          delete: {
            args: Prisma.UnitOfMeasureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>
          }
          update: {
            args: Prisma.UnitOfMeasureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>
          }
          deleteMany: {
            args: Prisma.UnitOfMeasureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UnitOfMeasureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UnitOfMeasureUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>[]
          }
          upsert: {
            args: Prisma.UnitOfMeasureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitOfMeasurePayload>
          }
          aggregate: {
            args: Prisma.UnitOfMeasureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUnitOfMeasure>
          }
          groupBy: {
            args: Prisma.UnitOfMeasureGroupByArgs<ExtArgs>
            result: $Utils.Optional<UnitOfMeasureGroupByOutputType>[]
          }
          count: {
            args: Prisma.UnitOfMeasureCountArgs<ExtArgs>
            result: $Utils.Optional<UnitOfMeasureCountAggregateOutputType> | number
          }
        }
      }
      Ingredient: {
        payload: Prisma.$IngredientPayload<ExtArgs>
        fields: Prisma.IngredientFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IngredientFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IngredientFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>
          }
          findFirst: {
            args: Prisma.IngredientFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IngredientFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>
          }
          findMany: {
            args: Prisma.IngredientFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>[]
          }
          create: {
            args: Prisma.IngredientCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>
          }
          createMany: {
            args: Prisma.IngredientCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IngredientCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>[]
          }
          delete: {
            args: Prisma.IngredientDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>
          }
          update: {
            args: Prisma.IngredientUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>
          }
          deleteMany: {
            args: Prisma.IngredientDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IngredientUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.IngredientUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>[]
          }
          upsert: {
            args: Prisma.IngredientUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IngredientPayload>
          }
          aggregate: {
            args: Prisma.IngredientAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIngredient>
          }
          groupBy: {
            args: Prisma.IngredientGroupByArgs<ExtArgs>
            result: $Utils.Optional<IngredientGroupByOutputType>[]
          }
          count: {
            args: Prisma.IngredientCountArgs<ExtArgs>
            result: $Utils.Optional<IngredientCountAggregateOutputType> | number
          }
        }
      }
      Recipe: {
        payload: Prisma.$RecipePayload<ExtArgs>
        fields: Prisma.RecipeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RecipeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RecipeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>
          }
          findFirst: {
            args: Prisma.RecipeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RecipeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>
          }
          findMany: {
            args: Prisma.RecipeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>[]
          }
          create: {
            args: Prisma.RecipeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>
          }
          createMany: {
            args: Prisma.RecipeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RecipeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>[]
          }
          delete: {
            args: Prisma.RecipeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>
          }
          update: {
            args: Prisma.RecipeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>
          }
          deleteMany: {
            args: Prisma.RecipeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RecipeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RecipeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>[]
          }
          upsert: {
            args: Prisma.RecipeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RecipePayload>
          }
          aggregate: {
            args: Prisma.RecipeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRecipe>
          }
          groupBy: {
            args: Prisma.RecipeGroupByArgs<ExtArgs>
            result: $Utils.Optional<RecipeGroupByOutputType>[]
          }
          count: {
            args: Prisma.RecipeCountArgs<ExtArgs>
            result: $Utils.Optional<RecipeCountAggregateOutputType> | number
          }
        }
      }
      UnitQuantity: {
        payload: Prisma.$UnitQuantityPayload<ExtArgs>
        fields: Prisma.UnitQuantityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UnitQuantityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UnitQuantityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>
          }
          findFirst: {
            args: Prisma.UnitQuantityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UnitQuantityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>
          }
          findMany: {
            args: Prisma.UnitQuantityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>[]
          }
          create: {
            args: Prisma.UnitQuantityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>
          }
          createMany: {
            args: Prisma.UnitQuantityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UnitQuantityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>[]
          }
          delete: {
            args: Prisma.UnitQuantityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>
          }
          update: {
            args: Prisma.UnitQuantityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>
          }
          deleteMany: {
            args: Prisma.UnitQuantityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UnitQuantityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UnitQuantityUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>[]
          }
          upsert: {
            args: Prisma.UnitQuantityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UnitQuantityPayload>
          }
          aggregate: {
            args: Prisma.UnitQuantityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUnitQuantity>
          }
          groupBy: {
            args: Prisma.UnitQuantityGroupByArgs<ExtArgs>
            result: $Utils.Optional<UnitQuantityGroupByOutputType>[]
          }
          count: {
            args: Prisma.UnitQuantityCountArgs<ExtArgs>
            result: $Utils.Optional<UnitQuantityCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    category?: CategoryOmit
    ingredientCategory?: IngredientCategoryOmit
    unitOfMeasure?: UnitOfMeasureOmit
    ingredient?: IngredientOmit
    recipe?: RecipeOmit
    unitQuantity?: UnitQuantityOmit
    user?: UserOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type CategoryCountOutputType
   */

  export type CategoryCountOutputType = {
    recipes: number
  }

  export type CategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipes?: boolean | CategoryCountOutputTypeCountRecipesArgs
  }

  // Custom InputTypes
  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CategoryCountOutputType
     */
    select?: CategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CategoryCountOutputType without action
   */
  export type CategoryCountOutputTypeCountRecipesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecipeWhereInput
  }


  /**
   * Count Type IngredientCategoryCountOutputType
   */

  export type IngredientCategoryCountOutputType = {
    ingredients: number
  }

  export type IngredientCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ingredients?: boolean | IngredientCategoryCountOutputTypeCountIngredientsArgs
  }

  // Custom InputTypes
  /**
   * IngredientCategoryCountOutputType without action
   */
  export type IngredientCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategoryCountOutputType
     */
    select?: IngredientCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * IngredientCategoryCountOutputType without action
   */
  export type IngredientCategoryCountOutputTypeCountIngredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IngredientWhereInput
  }


  /**
   * Count Type UnitOfMeasureCountOutputType
   */

  export type UnitOfMeasureCountOutputType = {
    recipesYield: number
    recipeIngredients: number
  }

  export type UnitOfMeasureCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipesYield?: boolean | UnitOfMeasureCountOutputTypeCountRecipesYieldArgs
    recipeIngredients?: boolean | UnitOfMeasureCountOutputTypeCountRecipeIngredientsArgs
  }

  // Custom InputTypes
  /**
   * UnitOfMeasureCountOutputType without action
   */
  export type UnitOfMeasureCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasureCountOutputType
     */
    select?: UnitOfMeasureCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UnitOfMeasureCountOutputType without action
   */
  export type UnitOfMeasureCountOutputTypeCountRecipesYieldArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecipeWhereInput
  }

  /**
   * UnitOfMeasureCountOutputType without action
   */
  export type UnitOfMeasureCountOutputTypeCountRecipeIngredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitQuantityWhereInput
  }


  /**
   * Count Type IngredientCountOutputType
   */

  export type IngredientCountOutputType = {
    recipeIngredients: number
  }

  export type IngredientCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipeIngredients?: boolean | IngredientCountOutputTypeCountRecipeIngredientsArgs
  }

  // Custom InputTypes
  /**
   * IngredientCountOutputType without action
   */
  export type IngredientCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCountOutputType
     */
    select?: IngredientCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * IngredientCountOutputType without action
   */
  export type IngredientCountOutputTypeCountRecipeIngredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitQuantityWhereInput
  }


  /**
   * Count Type RecipeCountOutputType
   */

  export type RecipeCountOutputType = {
    recipeIngredients: number
    usedAsSubRecipe: number
  }

  export type RecipeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipeIngredients?: boolean | RecipeCountOutputTypeCountRecipeIngredientsArgs
    usedAsSubRecipe?: boolean | RecipeCountOutputTypeCountUsedAsSubRecipeArgs
  }

  // Custom InputTypes
  /**
   * RecipeCountOutputType without action
   */
  export type RecipeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecipeCountOutputType
     */
    select?: RecipeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RecipeCountOutputType without action
   */
  export type RecipeCountOutputTypeCountRecipeIngredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitQuantityWhereInput
  }

  /**
   * RecipeCountOutputType without action
   */
  export type RecipeCountOutputTypeCountUsedAsSubRecipeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitQuantityWhereInput
  }


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    recipes: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipes?: boolean | UserCountOutputTypeCountRecipesArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRecipesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecipeWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Category
   */

  export type AggregateCategory = {
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  export type CategoryAvgAggregateOutputType = {
    id: number | null
  }

  export type CategorySumAggregateOutputType = {
    id: number | null
  }

  export type CategoryMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CategoryCountAggregateOutputType = {
    id: number
    name: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CategoryAvgAggregateInputType = {
    id?: true
  }

  export type CategorySumAggregateInputType = {
    id?: true
  }

  export type CategoryMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CategoryCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Category to aggregate.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Categories
    **/
    _count?: true | CategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CategoryMaxAggregateInputType
  }

  export type GetCategoryAggregateType<T extends CategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCategory[P]>
      : GetScalarType<T[P], AggregateCategory[P]>
  }




  export type CategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CategoryWhereInput
    orderBy?: CategoryOrderByWithAggregationInput | CategoryOrderByWithAggregationInput[]
    by: CategoryScalarFieldEnum[] | CategoryScalarFieldEnum
    having?: CategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CategoryCountAggregateInputType | true
    _avg?: CategoryAvgAggregateInputType
    _sum?: CategorySumAggregateInputType
    _min?: CategoryMinAggregateInputType
    _max?: CategoryMaxAggregateInputType
  }

  export type CategoryGroupByOutputType = {
    id: number
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: CategoryCountAggregateOutputType | null
    _avg: CategoryAvgAggregateOutputType | null
    _sum: CategorySumAggregateOutputType | null
    _min: CategoryMinAggregateOutputType | null
    _max: CategoryMaxAggregateOutputType | null
  }

  type GetCategoryGroupByPayload<T extends CategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CategoryGroupByOutputType[P]>
            : GetScalarType<T[P], CategoryGroupByOutputType[P]>
        }
      >
    >


  export type CategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    recipes?: boolean | Category$recipesArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["category"]>

  export type CategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["category"]>

  export type CategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["category"]>

  export type CategorySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["category"]>
  export type CategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipes?: boolean | Category$recipesArgs<ExtArgs>
    _count?: boolean | CategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type CategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Category"
    objects: {
      recipes: Prisma.$RecipePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["category"]>
    composites: {}
  }

  type CategoryGetPayload<S extends boolean | null | undefined | CategoryDefaultArgs> = $Result.GetResult<Prisma.$CategoryPayload, S>

  type CategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CategoryCountAggregateInputType | true
    }

  export interface CategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Category'], meta: { name: 'Category' } }
    /**
     * Find zero or one Category that matches the filter.
     * @param {CategoryFindUniqueArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CategoryFindUniqueArgs>(args: SelectSubset<T, CategoryFindUniqueArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Category that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CategoryFindUniqueOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, CategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CategoryFindFirstArgs>(args?: SelectSubset<T, CategoryFindFirstArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Category that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindFirstOrThrowArgs} args - Arguments to find a Category
     * @example
     * // Get one Category
     * const category = await prisma.category.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, CategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Categories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Categories
     * const categories = await prisma.category.findMany()
     * 
     * // Get first 10 Categories
     * const categories = await prisma.category.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const categoryWithIdOnly = await prisma.category.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CategoryFindManyArgs>(args?: SelectSubset<T, CategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Category.
     * @param {CategoryCreateArgs} args - Arguments to create a Category.
     * @example
     * // Create one Category
     * const Category = await prisma.category.create({
     *   data: {
     *     // ... data to create a Category
     *   }
     * })
     * 
     */
    create<T extends CategoryCreateArgs>(args: SelectSubset<T, CategoryCreateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Categories.
     * @param {CategoryCreateManyArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CategoryCreateManyArgs>(args?: SelectSubset<T, CategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Categories and returns the data saved in the database.
     * @param {CategoryCreateManyAndReturnArgs} args - Arguments to create many Categories.
     * @example
     * // Create many Categories
     * const category = await prisma.category.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, CategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Category.
     * @param {CategoryDeleteArgs} args - Arguments to delete one Category.
     * @example
     * // Delete one Category
     * const Category = await prisma.category.delete({
     *   where: {
     *     // ... filter to delete one Category
     *   }
     * })
     * 
     */
    delete<T extends CategoryDeleteArgs>(args: SelectSubset<T, CategoryDeleteArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Category.
     * @param {CategoryUpdateArgs} args - Arguments to update one Category.
     * @example
     * // Update one Category
     * const category = await prisma.category.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CategoryUpdateArgs>(args: SelectSubset<T, CategoryUpdateArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Categories.
     * @param {CategoryDeleteManyArgs} args - Arguments to filter Categories to delete.
     * @example
     * // Delete a few Categories
     * const { count } = await prisma.category.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CategoryDeleteManyArgs>(args?: SelectSubset<T, CategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CategoryUpdateManyArgs>(args: SelectSubset<T, CategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Categories and returns the data updated in the database.
     * @param {CategoryUpdateManyAndReturnArgs} args - Arguments to update many Categories.
     * @example
     * // Update many Categories
     * const category = await prisma.category.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Categories and only return the `id`
     * const categoryWithIdOnly = await prisma.category.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, CategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Category.
     * @param {CategoryUpsertArgs} args - Arguments to update or create a Category.
     * @example
     * // Update or create a Category
     * const category = await prisma.category.upsert({
     *   create: {
     *     // ... data to create a Category
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Category we want to update
     *   }
     * })
     */
    upsert<T extends CategoryUpsertArgs>(args: SelectSubset<T, CategoryUpsertArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Categories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryCountArgs} args - Arguments to filter Categories to count.
     * @example
     * // Count the number of Categories
     * const count = await prisma.category.count({
     *   where: {
     *     // ... the filter for the Categories we want to count
     *   }
     * })
    **/
    count<T extends CategoryCountArgs>(
      args?: Subset<T, CategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CategoryAggregateArgs>(args: Subset<T, CategoryAggregateArgs>): Prisma.PrismaPromise<GetCategoryAggregateType<T>>

    /**
     * Group by Category.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CategoryGroupByArgs['orderBy'] }
        : { orderBy?: CategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Category model
   */
  readonly fields: CategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Category.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recipes<T extends Category$recipesArgs<ExtArgs> = {}>(args?: Subset<T, Category$recipesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Category model
   */
  interface CategoryFieldRefs {
    readonly id: FieldRef<"Category", 'Int'>
    readonly name: FieldRef<"Category", 'String'>
    readonly description: FieldRef<"Category", 'String'>
    readonly createdAt: FieldRef<"Category", 'DateTime'>
    readonly updatedAt: FieldRef<"Category", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Category findUnique
   */
  export type CategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findUniqueOrThrow
   */
  export type CategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category findFirst
   */
  export type CategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findFirstOrThrow
   */
  export type CategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Category to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Categories.
     */
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category findMany
   */
  export type CategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter, which Categories to fetch.
     */
    where?: CategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Categories to fetch.
     */
    orderBy?: CategoryOrderByWithRelationInput | CategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Categories.
     */
    cursor?: CategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Categories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Categories.
     */
    skip?: number
    distinct?: CategoryScalarFieldEnum | CategoryScalarFieldEnum[]
  }

  /**
   * Category create
   */
  export type CategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a Category.
     */
    data: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
  }

  /**
   * Category createMany
   */
  export type CategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Category createManyAndReturn
   */
  export type CategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to create many Categories.
     */
    data: CategoryCreateManyInput | CategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Category update
   */
  export type CategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a Category.
     */
    data: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
    /**
     * Choose, which Category to update.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category updateMany
   */
  export type CategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Category updateManyAndReturn
   */
  export type CategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * The data used to update Categories.
     */
    data: XOR<CategoryUpdateManyMutationInput, CategoryUncheckedUpdateManyInput>
    /**
     * Filter which Categories to update
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to update.
     */
    limit?: number
  }

  /**
   * Category upsert
   */
  export type CategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the Category to update in case it exists.
     */
    where: CategoryWhereUniqueInput
    /**
     * In case the Category found by the `where` argument doesn't exist, create a new Category with this data.
     */
    create: XOR<CategoryCreateInput, CategoryUncheckedCreateInput>
    /**
     * In case the Category was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CategoryUpdateInput, CategoryUncheckedUpdateInput>
  }

  /**
   * Category delete
   */
  export type CategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    /**
     * Filter which Category to delete.
     */
    where: CategoryWhereUniqueInput
  }

  /**
   * Category deleteMany
   */
  export type CategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Categories to delete
     */
    where?: CategoryWhereInput
    /**
     * Limit how many Categories to delete.
     */
    limit?: number
  }

  /**
   * Category.recipes
   */
  export type Category$recipesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    where?: RecipeWhereInput
    orderBy?: RecipeOrderByWithRelationInput | RecipeOrderByWithRelationInput[]
    cursor?: RecipeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[]
  }

  /**
   * Category without action
   */
  export type CategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
  }


  /**
   * Model IngredientCategory
   */

  export type AggregateIngredientCategory = {
    _count: IngredientCategoryCountAggregateOutputType | null
    _avg: IngredientCategoryAvgAggregateOutputType | null
    _sum: IngredientCategorySumAggregateOutputType | null
    _min: IngredientCategoryMinAggregateOutputType | null
    _max: IngredientCategoryMaxAggregateOutputType | null
  }

  export type IngredientCategoryAvgAggregateOutputType = {
    id: number | null
  }

  export type IngredientCategorySumAggregateOutputType = {
    id: number | null
  }

  export type IngredientCategoryMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IngredientCategoryMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IngredientCategoryCountAggregateOutputType = {
    id: number
    name: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type IngredientCategoryAvgAggregateInputType = {
    id?: true
  }

  export type IngredientCategorySumAggregateInputType = {
    id?: true
  }

  export type IngredientCategoryMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IngredientCategoryMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IngredientCategoryCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type IngredientCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IngredientCategory to aggregate.
     */
    where?: IngredientCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngredientCategories to fetch.
     */
    orderBy?: IngredientCategoryOrderByWithRelationInput | IngredientCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IngredientCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngredientCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngredientCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IngredientCategories
    **/
    _count?: true | IngredientCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IngredientCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IngredientCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IngredientCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IngredientCategoryMaxAggregateInputType
  }

  export type GetIngredientCategoryAggregateType<T extends IngredientCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateIngredientCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIngredientCategory[P]>
      : GetScalarType<T[P], AggregateIngredientCategory[P]>
  }




  export type IngredientCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IngredientCategoryWhereInput
    orderBy?: IngredientCategoryOrderByWithAggregationInput | IngredientCategoryOrderByWithAggregationInput[]
    by: IngredientCategoryScalarFieldEnum[] | IngredientCategoryScalarFieldEnum
    having?: IngredientCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IngredientCategoryCountAggregateInputType | true
    _avg?: IngredientCategoryAvgAggregateInputType
    _sum?: IngredientCategorySumAggregateInputType
    _min?: IngredientCategoryMinAggregateInputType
    _max?: IngredientCategoryMaxAggregateInputType
  }

  export type IngredientCategoryGroupByOutputType = {
    id: number
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: IngredientCategoryCountAggregateOutputType | null
    _avg: IngredientCategoryAvgAggregateOutputType | null
    _sum: IngredientCategorySumAggregateOutputType | null
    _min: IngredientCategoryMinAggregateOutputType | null
    _max: IngredientCategoryMaxAggregateOutputType | null
  }

  type GetIngredientCategoryGroupByPayload<T extends IngredientCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IngredientCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IngredientCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IngredientCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], IngredientCategoryGroupByOutputType[P]>
        }
      >
    >


  export type IngredientCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ingredients?: boolean | IngredientCategory$ingredientsArgs<ExtArgs>
    _count?: boolean | IngredientCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ingredientCategory"]>

  export type IngredientCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ingredientCategory"]>

  export type IngredientCategorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["ingredientCategory"]>

  export type IngredientCategorySelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type IngredientCategoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "createdAt" | "updatedAt", ExtArgs["result"]["ingredientCategory"]>
  export type IngredientCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ingredients?: boolean | IngredientCategory$ingredientsArgs<ExtArgs>
    _count?: boolean | IngredientCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type IngredientCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type IngredientCategoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $IngredientCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IngredientCategory"
    objects: {
      ingredients: Prisma.$IngredientPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ingredientCategory"]>
    composites: {}
  }

  type IngredientCategoryGetPayload<S extends boolean | null | undefined | IngredientCategoryDefaultArgs> = $Result.GetResult<Prisma.$IngredientCategoryPayload, S>

  type IngredientCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IngredientCategoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IngredientCategoryCountAggregateInputType | true
    }

  export interface IngredientCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IngredientCategory'], meta: { name: 'IngredientCategory' } }
    /**
     * Find zero or one IngredientCategory that matches the filter.
     * @param {IngredientCategoryFindUniqueArgs} args - Arguments to find a IngredientCategory
     * @example
     * // Get one IngredientCategory
     * const ingredientCategory = await prisma.ingredientCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IngredientCategoryFindUniqueArgs>(args: SelectSubset<T, IngredientCategoryFindUniqueArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one IngredientCategory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IngredientCategoryFindUniqueOrThrowArgs} args - Arguments to find a IngredientCategory
     * @example
     * // Get one IngredientCategory
     * const ingredientCategory = await prisma.ingredientCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IngredientCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, IngredientCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IngredientCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCategoryFindFirstArgs} args - Arguments to find a IngredientCategory
     * @example
     * // Get one IngredientCategory
     * const ingredientCategory = await prisma.ingredientCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IngredientCategoryFindFirstArgs>(args?: SelectSubset<T, IngredientCategoryFindFirstArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first IngredientCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCategoryFindFirstOrThrowArgs} args - Arguments to find a IngredientCategory
     * @example
     * // Get one IngredientCategory
     * const ingredientCategory = await prisma.ingredientCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IngredientCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, IngredientCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more IngredientCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IngredientCategories
     * const ingredientCategories = await prisma.ingredientCategory.findMany()
     * 
     * // Get first 10 IngredientCategories
     * const ingredientCategories = await prisma.ingredientCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ingredientCategoryWithIdOnly = await prisma.ingredientCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IngredientCategoryFindManyArgs>(args?: SelectSubset<T, IngredientCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a IngredientCategory.
     * @param {IngredientCategoryCreateArgs} args - Arguments to create a IngredientCategory.
     * @example
     * // Create one IngredientCategory
     * const IngredientCategory = await prisma.ingredientCategory.create({
     *   data: {
     *     // ... data to create a IngredientCategory
     *   }
     * })
     * 
     */
    create<T extends IngredientCategoryCreateArgs>(args: SelectSubset<T, IngredientCategoryCreateArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many IngredientCategories.
     * @param {IngredientCategoryCreateManyArgs} args - Arguments to create many IngredientCategories.
     * @example
     * // Create many IngredientCategories
     * const ingredientCategory = await prisma.ingredientCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IngredientCategoryCreateManyArgs>(args?: SelectSubset<T, IngredientCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IngredientCategories and returns the data saved in the database.
     * @param {IngredientCategoryCreateManyAndReturnArgs} args - Arguments to create many IngredientCategories.
     * @example
     * // Create many IngredientCategories
     * const ingredientCategory = await prisma.ingredientCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IngredientCategories and only return the `id`
     * const ingredientCategoryWithIdOnly = await prisma.ingredientCategory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IngredientCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, IngredientCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a IngredientCategory.
     * @param {IngredientCategoryDeleteArgs} args - Arguments to delete one IngredientCategory.
     * @example
     * // Delete one IngredientCategory
     * const IngredientCategory = await prisma.ingredientCategory.delete({
     *   where: {
     *     // ... filter to delete one IngredientCategory
     *   }
     * })
     * 
     */
    delete<T extends IngredientCategoryDeleteArgs>(args: SelectSubset<T, IngredientCategoryDeleteArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one IngredientCategory.
     * @param {IngredientCategoryUpdateArgs} args - Arguments to update one IngredientCategory.
     * @example
     * // Update one IngredientCategory
     * const ingredientCategory = await prisma.ingredientCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IngredientCategoryUpdateArgs>(args: SelectSubset<T, IngredientCategoryUpdateArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more IngredientCategories.
     * @param {IngredientCategoryDeleteManyArgs} args - Arguments to filter IngredientCategories to delete.
     * @example
     * // Delete a few IngredientCategories
     * const { count } = await prisma.ingredientCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IngredientCategoryDeleteManyArgs>(args?: SelectSubset<T, IngredientCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IngredientCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IngredientCategories
     * const ingredientCategory = await prisma.ingredientCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IngredientCategoryUpdateManyArgs>(args: SelectSubset<T, IngredientCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IngredientCategories and returns the data updated in the database.
     * @param {IngredientCategoryUpdateManyAndReturnArgs} args - Arguments to update many IngredientCategories.
     * @example
     * // Update many IngredientCategories
     * const ingredientCategory = await prisma.ingredientCategory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more IngredientCategories and only return the `id`
     * const ingredientCategoryWithIdOnly = await prisma.ingredientCategory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IngredientCategoryUpdateManyAndReturnArgs>(args: SelectSubset<T, IngredientCategoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one IngredientCategory.
     * @param {IngredientCategoryUpsertArgs} args - Arguments to update or create a IngredientCategory.
     * @example
     * // Update or create a IngredientCategory
     * const ingredientCategory = await prisma.ingredientCategory.upsert({
     *   create: {
     *     // ... data to create a IngredientCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IngredientCategory we want to update
     *   }
     * })
     */
    upsert<T extends IngredientCategoryUpsertArgs>(args: SelectSubset<T, IngredientCategoryUpsertArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of IngredientCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCategoryCountArgs} args - Arguments to filter IngredientCategories to count.
     * @example
     * // Count the number of IngredientCategories
     * const count = await prisma.ingredientCategory.count({
     *   where: {
     *     // ... the filter for the IngredientCategories we want to count
     *   }
     * })
    **/
    count<T extends IngredientCategoryCountArgs>(
      args?: Subset<T, IngredientCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IngredientCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IngredientCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IngredientCategoryAggregateArgs>(args: Subset<T, IngredientCategoryAggregateArgs>): Prisma.PrismaPromise<GetIngredientCategoryAggregateType<T>>

    /**
     * Group by IngredientCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IngredientCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IngredientCategoryGroupByArgs['orderBy'] }
        : { orderBy?: IngredientCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IngredientCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIngredientCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IngredientCategory model
   */
  readonly fields: IngredientCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IngredientCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IngredientCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ingredients<T extends IngredientCategory$ingredientsArgs<ExtArgs> = {}>(args?: Subset<T, IngredientCategory$ingredientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IngredientCategory model
   */
  interface IngredientCategoryFieldRefs {
    readonly id: FieldRef<"IngredientCategory", 'Int'>
    readonly name: FieldRef<"IngredientCategory", 'String'>
    readonly description: FieldRef<"IngredientCategory", 'String'>
    readonly createdAt: FieldRef<"IngredientCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"IngredientCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IngredientCategory findUnique
   */
  export type IngredientCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * Filter, which IngredientCategory to fetch.
     */
    where: IngredientCategoryWhereUniqueInput
  }

  /**
   * IngredientCategory findUniqueOrThrow
   */
  export type IngredientCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * Filter, which IngredientCategory to fetch.
     */
    where: IngredientCategoryWhereUniqueInput
  }

  /**
   * IngredientCategory findFirst
   */
  export type IngredientCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * Filter, which IngredientCategory to fetch.
     */
    where?: IngredientCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngredientCategories to fetch.
     */
    orderBy?: IngredientCategoryOrderByWithRelationInput | IngredientCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IngredientCategories.
     */
    cursor?: IngredientCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngredientCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngredientCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IngredientCategories.
     */
    distinct?: IngredientCategoryScalarFieldEnum | IngredientCategoryScalarFieldEnum[]
  }

  /**
   * IngredientCategory findFirstOrThrow
   */
  export type IngredientCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * Filter, which IngredientCategory to fetch.
     */
    where?: IngredientCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngredientCategories to fetch.
     */
    orderBy?: IngredientCategoryOrderByWithRelationInput | IngredientCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IngredientCategories.
     */
    cursor?: IngredientCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngredientCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngredientCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IngredientCategories.
     */
    distinct?: IngredientCategoryScalarFieldEnum | IngredientCategoryScalarFieldEnum[]
  }

  /**
   * IngredientCategory findMany
   */
  export type IngredientCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * Filter, which IngredientCategories to fetch.
     */
    where?: IngredientCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IngredientCategories to fetch.
     */
    orderBy?: IngredientCategoryOrderByWithRelationInput | IngredientCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IngredientCategories.
     */
    cursor?: IngredientCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IngredientCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IngredientCategories.
     */
    skip?: number
    distinct?: IngredientCategoryScalarFieldEnum | IngredientCategoryScalarFieldEnum[]
  }

  /**
   * IngredientCategory create
   */
  export type IngredientCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a IngredientCategory.
     */
    data: XOR<IngredientCategoryCreateInput, IngredientCategoryUncheckedCreateInput>
  }

  /**
   * IngredientCategory createMany
   */
  export type IngredientCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IngredientCategories.
     */
    data: IngredientCategoryCreateManyInput | IngredientCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IngredientCategory createManyAndReturn
   */
  export type IngredientCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * The data used to create many IngredientCategories.
     */
    data: IngredientCategoryCreateManyInput | IngredientCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IngredientCategory update
   */
  export type IngredientCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a IngredientCategory.
     */
    data: XOR<IngredientCategoryUpdateInput, IngredientCategoryUncheckedUpdateInput>
    /**
     * Choose, which IngredientCategory to update.
     */
    where: IngredientCategoryWhereUniqueInput
  }

  /**
   * IngredientCategory updateMany
   */
  export type IngredientCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IngredientCategories.
     */
    data: XOR<IngredientCategoryUpdateManyMutationInput, IngredientCategoryUncheckedUpdateManyInput>
    /**
     * Filter which IngredientCategories to update
     */
    where?: IngredientCategoryWhereInput
    /**
     * Limit how many IngredientCategories to update.
     */
    limit?: number
  }

  /**
   * IngredientCategory updateManyAndReturn
   */
  export type IngredientCategoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * The data used to update IngredientCategories.
     */
    data: XOR<IngredientCategoryUpdateManyMutationInput, IngredientCategoryUncheckedUpdateManyInput>
    /**
     * Filter which IngredientCategories to update
     */
    where?: IngredientCategoryWhereInput
    /**
     * Limit how many IngredientCategories to update.
     */
    limit?: number
  }

  /**
   * IngredientCategory upsert
   */
  export type IngredientCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the IngredientCategory to update in case it exists.
     */
    where: IngredientCategoryWhereUniqueInput
    /**
     * In case the IngredientCategory found by the `where` argument doesn't exist, create a new IngredientCategory with this data.
     */
    create: XOR<IngredientCategoryCreateInput, IngredientCategoryUncheckedCreateInput>
    /**
     * In case the IngredientCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IngredientCategoryUpdateInput, IngredientCategoryUncheckedUpdateInput>
  }

  /**
   * IngredientCategory delete
   */
  export type IngredientCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    /**
     * Filter which IngredientCategory to delete.
     */
    where: IngredientCategoryWhereUniqueInput
  }

  /**
   * IngredientCategory deleteMany
   */
  export type IngredientCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IngredientCategories to delete
     */
    where?: IngredientCategoryWhereInput
    /**
     * Limit how many IngredientCategories to delete.
     */
    limit?: number
  }

  /**
   * IngredientCategory.ingredients
   */
  export type IngredientCategory$ingredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    where?: IngredientWhereInput
    orderBy?: IngredientOrderByWithRelationInput | IngredientOrderByWithRelationInput[]
    cursor?: IngredientWhereUniqueInput
    take?: number
    skip?: number
    distinct?: IngredientScalarFieldEnum | IngredientScalarFieldEnum[]
  }

  /**
   * IngredientCategory without action
   */
  export type IngredientCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
  }


  /**
   * Model UnitOfMeasure
   */

  export type AggregateUnitOfMeasure = {
    _count: UnitOfMeasureCountAggregateOutputType | null
    _avg: UnitOfMeasureAvgAggregateOutputType | null
    _sum: UnitOfMeasureSumAggregateOutputType | null
    _min: UnitOfMeasureMinAggregateOutputType | null
    _max: UnitOfMeasureMaxAggregateOutputType | null
  }

  export type UnitOfMeasureAvgAggregateOutputType = {
    id: number | null
  }

  export type UnitOfMeasureSumAggregateOutputType = {
    id: number | null
  }

  export type UnitOfMeasureMinAggregateOutputType = {
    id: number | null
    name: string | null
    abbreviation: string | null
    type: $Enums.UnitType | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UnitOfMeasureMaxAggregateOutputType = {
    id: number | null
    name: string | null
    abbreviation: string | null
    type: $Enums.UnitType | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UnitOfMeasureCountAggregateOutputType = {
    id: number
    name: number
    abbreviation: number
    type: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UnitOfMeasureAvgAggregateInputType = {
    id?: true
  }

  export type UnitOfMeasureSumAggregateInputType = {
    id?: true
  }

  export type UnitOfMeasureMinAggregateInputType = {
    id?: true
    name?: true
    abbreviation?: true
    type?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UnitOfMeasureMaxAggregateInputType = {
    id?: true
    name?: true
    abbreviation?: true
    type?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UnitOfMeasureCountAggregateInputType = {
    id?: true
    name?: true
    abbreviation?: true
    type?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UnitOfMeasureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UnitOfMeasure to aggregate.
     */
    where?: UnitOfMeasureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitOfMeasures to fetch.
     */
    orderBy?: UnitOfMeasureOrderByWithRelationInput | UnitOfMeasureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UnitOfMeasureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitOfMeasures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitOfMeasures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UnitOfMeasures
    **/
    _count?: true | UnitOfMeasureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UnitOfMeasureAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UnitOfMeasureSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UnitOfMeasureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UnitOfMeasureMaxAggregateInputType
  }

  export type GetUnitOfMeasureAggregateType<T extends UnitOfMeasureAggregateArgs> = {
        [P in keyof T & keyof AggregateUnitOfMeasure]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUnitOfMeasure[P]>
      : GetScalarType<T[P], AggregateUnitOfMeasure[P]>
  }




  export type UnitOfMeasureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitOfMeasureWhereInput
    orderBy?: UnitOfMeasureOrderByWithAggregationInput | UnitOfMeasureOrderByWithAggregationInput[]
    by: UnitOfMeasureScalarFieldEnum[] | UnitOfMeasureScalarFieldEnum
    having?: UnitOfMeasureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UnitOfMeasureCountAggregateInputType | true
    _avg?: UnitOfMeasureAvgAggregateInputType
    _sum?: UnitOfMeasureSumAggregateInputType
    _min?: UnitOfMeasureMinAggregateInputType
    _max?: UnitOfMeasureMaxAggregateInputType
  }

  export type UnitOfMeasureGroupByOutputType = {
    id: number
    name: string
    abbreviation: string | null
    type: $Enums.UnitType | null
    createdAt: Date
    updatedAt: Date
    _count: UnitOfMeasureCountAggregateOutputType | null
    _avg: UnitOfMeasureAvgAggregateOutputType | null
    _sum: UnitOfMeasureSumAggregateOutputType | null
    _min: UnitOfMeasureMinAggregateOutputType | null
    _max: UnitOfMeasureMaxAggregateOutputType | null
  }

  type GetUnitOfMeasureGroupByPayload<T extends UnitOfMeasureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UnitOfMeasureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UnitOfMeasureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UnitOfMeasureGroupByOutputType[P]>
            : GetScalarType<T[P], UnitOfMeasureGroupByOutputType[P]>
        }
      >
    >


  export type UnitOfMeasureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    abbreviation?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    recipesYield?: boolean | UnitOfMeasure$recipesYieldArgs<ExtArgs>
    recipeIngredients?: boolean | UnitOfMeasure$recipeIngredientsArgs<ExtArgs>
    _count?: boolean | UnitOfMeasureCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unitOfMeasure"]>

  export type UnitOfMeasureSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    abbreviation?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["unitOfMeasure"]>

  export type UnitOfMeasureSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    abbreviation?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["unitOfMeasure"]>

  export type UnitOfMeasureSelectScalar = {
    id?: boolean
    name?: boolean
    abbreviation?: boolean
    type?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UnitOfMeasureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "abbreviation" | "type" | "createdAt" | "updatedAt", ExtArgs["result"]["unitOfMeasure"]>
  export type UnitOfMeasureInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipesYield?: boolean | UnitOfMeasure$recipesYieldArgs<ExtArgs>
    recipeIngredients?: boolean | UnitOfMeasure$recipeIngredientsArgs<ExtArgs>
    _count?: boolean | UnitOfMeasureCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UnitOfMeasureIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UnitOfMeasureIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UnitOfMeasurePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UnitOfMeasure"
    objects: {
      recipesYield: Prisma.$RecipePayload<ExtArgs>[]
      recipeIngredients: Prisma.$UnitQuantityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      abbreviation: string | null
      type: $Enums.UnitType | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["unitOfMeasure"]>
    composites: {}
  }

  type UnitOfMeasureGetPayload<S extends boolean | null | undefined | UnitOfMeasureDefaultArgs> = $Result.GetResult<Prisma.$UnitOfMeasurePayload, S>

  type UnitOfMeasureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UnitOfMeasureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UnitOfMeasureCountAggregateInputType | true
    }

  export interface UnitOfMeasureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UnitOfMeasure'], meta: { name: 'UnitOfMeasure' } }
    /**
     * Find zero or one UnitOfMeasure that matches the filter.
     * @param {UnitOfMeasureFindUniqueArgs} args - Arguments to find a UnitOfMeasure
     * @example
     * // Get one UnitOfMeasure
     * const unitOfMeasure = await prisma.unitOfMeasure.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UnitOfMeasureFindUniqueArgs>(args: SelectSubset<T, UnitOfMeasureFindUniqueArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UnitOfMeasure that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UnitOfMeasureFindUniqueOrThrowArgs} args - Arguments to find a UnitOfMeasure
     * @example
     * // Get one UnitOfMeasure
     * const unitOfMeasure = await prisma.unitOfMeasure.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UnitOfMeasureFindUniqueOrThrowArgs>(args: SelectSubset<T, UnitOfMeasureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UnitOfMeasure that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitOfMeasureFindFirstArgs} args - Arguments to find a UnitOfMeasure
     * @example
     * // Get one UnitOfMeasure
     * const unitOfMeasure = await prisma.unitOfMeasure.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UnitOfMeasureFindFirstArgs>(args?: SelectSubset<T, UnitOfMeasureFindFirstArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UnitOfMeasure that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitOfMeasureFindFirstOrThrowArgs} args - Arguments to find a UnitOfMeasure
     * @example
     * // Get one UnitOfMeasure
     * const unitOfMeasure = await prisma.unitOfMeasure.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UnitOfMeasureFindFirstOrThrowArgs>(args?: SelectSubset<T, UnitOfMeasureFindFirstOrThrowArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UnitOfMeasures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitOfMeasureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UnitOfMeasures
     * const unitOfMeasures = await prisma.unitOfMeasure.findMany()
     * 
     * // Get first 10 UnitOfMeasures
     * const unitOfMeasures = await prisma.unitOfMeasure.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const unitOfMeasureWithIdOnly = await prisma.unitOfMeasure.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UnitOfMeasureFindManyArgs>(args?: SelectSubset<T, UnitOfMeasureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UnitOfMeasure.
     * @param {UnitOfMeasureCreateArgs} args - Arguments to create a UnitOfMeasure.
     * @example
     * // Create one UnitOfMeasure
     * const UnitOfMeasure = await prisma.unitOfMeasure.create({
     *   data: {
     *     // ... data to create a UnitOfMeasure
     *   }
     * })
     * 
     */
    create<T extends UnitOfMeasureCreateArgs>(args: SelectSubset<T, UnitOfMeasureCreateArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UnitOfMeasures.
     * @param {UnitOfMeasureCreateManyArgs} args - Arguments to create many UnitOfMeasures.
     * @example
     * // Create many UnitOfMeasures
     * const unitOfMeasure = await prisma.unitOfMeasure.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UnitOfMeasureCreateManyArgs>(args?: SelectSubset<T, UnitOfMeasureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UnitOfMeasures and returns the data saved in the database.
     * @param {UnitOfMeasureCreateManyAndReturnArgs} args - Arguments to create many UnitOfMeasures.
     * @example
     * // Create many UnitOfMeasures
     * const unitOfMeasure = await prisma.unitOfMeasure.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UnitOfMeasures and only return the `id`
     * const unitOfMeasureWithIdOnly = await prisma.unitOfMeasure.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UnitOfMeasureCreateManyAndReturnArgs>(args?: SelectSubset<T, UnitOfMeasureCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UnitOfMeasure.
     * @param {UnitOfMeasureDeleteArgs} args - Arguments to delete one UnitOfMeasure.
     * @example
     * // Delete one UnitOfMeasure
     * const UnitOfMeasure = await prisma.unitOfMeasure.delete({
     *   where: {
     *     // ... filter to delete one UnitOfMeasure
     *   }
     * })
     * 
     */
    delete<T extends UnitOfMeasureDeleteArgs>(args: SelectSubset<T, UnitOfMeasureDeleteArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UnitOfMeasure.
     * @param {UnitOfMeasureUpdateArgs} args - Arguments to update one UnitOfMeasure.
     * @example
     * // Update one UnitOfMeasure
     * const unitOfMeasure = await prisma.unitOfMeasure.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UnitOfMeasureUpdateArgs>(args: SelectSubset<T, UnitOfMeasureUpdateArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UnitOfMeasures.
     * @param {UnitOfMeasureDeleteManyArgs} args - Arguments to filter UnitOfMeasures to delete.
     * @example
     * // Delete a few UnitOfMeasures
     * const { count } = await prisma.unitOfMeasure.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UnitOfMeasureDeleteManyArgs>(args?: SelectSubset<T, UnitOfMeasureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UnitOfMeasures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitOfMeasureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UnitOfMeasures
     * const unitOfMeasure = await prisma.unitOfMeasure.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UnitOfMeasureUpdateManyArgs>(args: SelectSubset<T, UnitOfMeasureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UnitOfMeasures and returns the data updated in the database.
     * @param {UnitOfMeasureUpdateManyAndReturnArgs} args - Arguments to update many UnitOfMeasures.
     * @example
     * // Update many UnitOfMeasures
     * const unitOfMeasure = await prisma.unitOfMeasure.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UnitOfMeasures and only return the `id`
     * const unitOfMeasureWithIdOnly = await prisma.unitOfMeasure.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UnitOfMeasureUpdateManyAndReturnArgs>(args: SelectSubset<T, UnitOfMeasureUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UnitOfMeasure.
     * @param {UnitOfMeasureUpsertArgs} args - Arguments to update or create a UnitOfMeasure.
     * @example
     * // Update or create a UnitOfMeasure
     * const unitOfMeasure = await prisma.unitOfMeasure.upsert({
     *   create: {
     *     // ... data to create a UnitOfMeasure
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UnitOfMeasure we want to update
     *   }
     * })
     */
    upsert<T extends UnitOfMeasureUpsertArgs>(args: SelectSubset<T, UnitOfMeasureUpsertArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UnitOfMeasures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitOfMeasureCountArgs} args - Arguments to filter UnitOfMeasures to count.
     * @example
     * // Count the number of UnitOfMeasures
     * const count = await prisma.unitOfMeasure.count({
     *   where: {
     *     // ... the filter for the UnitOfMeasures we want to count
     *   }
     * })
    **/
    count<T extends UnitOfMeasureCountArgs>(
      args?: Subset<T, UnitOfMeasureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UnitOfMeasureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UnitOfMeasure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitOfMeasureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UnitOfMeasureAggregateArgs>(args: Subset<T, UnitOfMeasureAggregateArgs>): Prisma.PrismaPromise<GetUnitOfMeasureAggregateType<T>>

    /**
     * Group by UnitOfMeasure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitOfMeasureGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UnitOfMeasureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UnitOfMeasureGroupByArgs['orderBy'] }
        : { orderBy?: UnitOfMeasureGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UnitOfMeasureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUnitOfMeasureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UnitOfMeasure model
   */
  readonly fields: UnitOfMeasureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UnitOfMeasure.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UnitOfMeasureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recipesYield<T extends UnitOfMeasure$recipesYieldArgs<ExtArgs> = {}>(args?: Subset<T, UnitOfMeasure$recipesYieldArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    recipeIngredients<T extends UnitOfMeasure$recipeIngredientsArgs<ExtArgs> = {}>(args?: Subset<T, UnitOfMeasure$recipeIngredientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UnitOfMeasure model
   */
  interface UnitOfMeasureFieldRefs {
    readonly id: FieldRef<"UnitOfMeasure", 'Int'>
    readonly name: FieldRef<"UnitOfMeasure", 'String'>
    readonly abbreviation: FieldRef<"UnitOfMeasure", 'String'>
    readonly type: FieldRef<"UnitOfMeasure", 'UnitType'>
    readonly createdAt: FieldRef<"UnitOfMeasure", 'DateTime'>
    readonly updatedAt: FieldRef<"UnitOfMeasure", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UnitOfMeasure findUnique
   */
  export type UnitOfMeasureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * Filter, which UnitOfMeasure to fetch.
     */
    where: UnitOfMeasureWhereUniqueInput
  }

  /**
   * UnitOfMeasure findUniqueOrThrow
   */
  export type UnitOfMeasureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * Filter, which UnitOfMeasure to fetch.
     */
    where: UnitOfMeasureWhereUniqueInput
  }

  /**
   * UnitOfMeasure findFirst
   */
  export type UnitOfMeasureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * Filter, which UnitOfMeasure to fetch.
     */
    where?: UnitOfMeasureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitOfMeasures to fetch.
     */
    orderBy?: UnitOfMeasureOrderByWithRelationInput | UnitOfMeasureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UnitOfMeasures.
     */
    cursor?: UnitOfMeasureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitOfMeasures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitOfMeasures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UnitOfMeasures.
     */
    distinct?: UnitOfMeasureScalarFieldEnum | UnitOfMeasureScalarFieldEnum[]
  }

  /**
   * UnitOfMeasure findFirstOrThrow
   */
  export type UnitOfMeasureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * Filter, which UnitOfMeasure to fetch.
     */
    where?: UnitOfMeasureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitOfMeasures to fetch.
     */
    orderBy?: UnitOfMeasureOrderByWithRelationInput | UnitOfMeasureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UnitOfMeasures.
     */
    cursor?: UnitOfMeasureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitOfMeasures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitOfMeasures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UnitOfMeasures.
     */
    distinct?: UnitOfMeasureScalarFieldEnum | UnitOfMeasureScalarFieldEnum[]
  }

  /**
   * UnitOfMeasure findMany
   */
  export type UnitOfMeasureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * Filter, which UnitOfMeasures to fetch.
     */
    where?: UnitOfMeasureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitOfMeasures to fetch.
     */
    orderBy?: UnitOfMeasureOrderByWithRelationInput | UnitOfMeasureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UnitOfMeasures.
     */
    cursor?: UnitOfMeasureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitOfMeasures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitOfMeasures.
     */
    skip?: number
    distinct?: UnitOfMeasureScalarFieldEnum | UnitOfMeasureScalarFieldEnum[]
  }

  /**
   * UnitOfMeasure create
   */
  export type UnitOfMeasureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * The data needed to create a UnitOfMeasure.
     */
    data: XOR<UnitOfMeasureCreateInput, UnitOfMeasureUncheckedCreateInput>
  }

  /**
   * UnitOfMeasure createMany
   */
  export type UnitOfMeasureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UnitOfMeasures.
     */
    data: UnitOfMeasureCreateManyInput | UnitOfMeasureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UnitOfMeasure createManyAndReturn
   */
  export type UnitOfMeasureCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * The data used to create many UnitOfMeasures.
     */
    data: UnitOfMeasureCreateManyInput | UnitOfMeasureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UnitOfMeasure update
   */
  export type UnitOfMeasureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * The data needed to update a UnitOfMeasure.
     */
    data: XOR<UnitOfMeasureUpdateInput, UnitOfMeasureUncheckedUpdateInput>
    /**
     * Choose, which UnitOfMeasure to update.
     */
    where: UnitOfMeasureWhereUniqueInput
  }

  /**
   * UnitOfMeasure updateMany
   */
  export type UnitOfMeasureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UnitOfMeasures.
     */
    data: XOR<UnitOfMeasureUpdateManyMutationInput, UnitOfMeasureUncheckedUpdateManyInput>
    /**
     * Filter which UnitOfMeasures to update
     */
    where?: UnitOfMeasureWhereInput
    /**
     * Limit how many UnitOfMeasures to update.
     */
    limit?: number
  }

  /**
   * UnitOfMeasure updateManyAndReturn
   */
  export type UnitOfMeasureUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * The data used to update UnitOfMeasures.
     */
    data: XOR<UnitOfMeasureUpdateManyMutationInput, UnitOfMeasureUncheckedUpdateManyInput>
    /**
     * Filter which UnitOfMeasures to update
     */
    where?: UnitOfMeasureWhereInput
    /**
     * Limit how many UnitOfMeasures to update.
     */
    limit?: number
  }

  /**
   * UnitOfMeasure upsert
   */
  export type UnitOfMeasureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * The filter to search for the UnitOfMeasure to update in case it exists.
     */
    where: UnitOfMeasureWhereUniqueInput
    /**
     * In case the UnitOfMeasure found by the `where` argument doesn't exist, create a new UnitOfMeasure with this data.
     */
    create: XOR<UnitOfMeasureCreateInput, UnitOfMeasureUncheckedCreateInput>
    /**
     * In case the UnitOfMeasure was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UnitOfMeasureUpdateInput, UnitOfMeasureUncheckedUpdateInput>
  }

  /**
   * UnitOfMeasure delete
   */
  export type UnitOfMeasureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    /**
     * Filter which UnitOfMeasure to delete.
     */
    where: UnitOfMeasureWhereUniqueInput
  }

  /**
   * UnitOfMeasure deleteMany
   */
  export type UnitOfMeasureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UnitOfMeasures to delete
     */
    where?: UnitOfMeasureWhereInput
    /**
     * Limit how many UnitOfMeasures to delete.
     */
    limit?: number
  }

  /**
   * UnitOfMeasure.recipesYield
   */
  export type UnitOfMeasure$recipesYieldArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    where?: RecipeWhereInput
    orderBy?: RecipeOrderByWithRelationInput | RecipeOrderByWithRelationInput[]
    cursor?: RecipeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[]
  }

  /**
   * UnitOfMeasure.recipeIngredients
   */
  export type UnitOfMeasure$recipeIngredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    where?: UnitQuantityWhereInput
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    cursor?: UnitQuantityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UnitQuantityScalarFieldEnum | UnitQuantityScalarFieldEnum[]
  }

  /**
   * UnitOfMeasure without action
   */
  export type UnitOfMeasureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
  }


  /**
   * Model Ingredient
   */

  export type AggregateIngredient = {
    _count: IngredientCountAggregateOutputType | null
    _avg: IngredientAvgAggregateOutputType | null
    _sum: IngredientSumAggregateOutputType | null
    _min: IngredientMinAggregateOutputType | null
    _max: IngredientMaxAggregateOutputType | null
  }

  export type IngredientAvgAggregateOutputType = {
    id: number | null
    ingredientCategoryId: number | null
  }

  export type IngredientSumAggregateOutputType = {
    id: number | null
    ingredientCategoryId: number | null
  }

  export type IngredientMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    ingredientCategoryId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IngredientMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    ingredientCategoryId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type IngredientCountAggregateOutputType = {
    id: number
    name: number
    description: number
    ingredientCategoryId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type IngredientAvgAggregateInputType = {
    id?: true
    ingredientCategoryId?: true
  }

  export type IngredientSumAggregateInputType = {
    id?: true
    ingredientCategoryId?: true
  }

  export type IngredientMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    ingredientCategoryId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IngredientMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    ingredientCategoryId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type IngredientCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    ingredientCategoryId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type IngredientAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ingredient to aggregate.
     */
    where?: IngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredients to fetch.
     */
    orderBy?: IngredientOrderByWithRelationInput | IngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Ingredients
    **/
    _count?: true | IngredientCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IngredientAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IngredientSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IngredientMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IngredientMaxAggregateInputType
  }

  export type GetIngredientAggregateType<T extends IngredientAggregateArgs> = {
        [P in keyof T & keyof AggregateIngredient]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIngredient[P]>
      : GetScalarType<T[P], AggregateIngredient[P]>
  }




  export type IngredientGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IngredientWhereInput
    orderBy?: IngredientOrderByWithAggregationInput | IngredientOrderByWithAggregationInput[]
    by: IngredientScalarFieldEnum[] | IngredientScalarFieldEnum
    having?: IngredientScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IngredientCountAggregateInputType | true
    _avg?: IngredientAvgAggregateInputType
    _sum?: IngredientSumAggregateInputType
    _min?: IngredientMinAggregateInputType
    _max?: IngredientMaxAggregateInputType
  }

  export type IngredientGroupByOutputType = {
    id: number
    name: string
    description: string | null
    ingredientCategoryId: number | null
    createdAt: Date
    updatedAt: Date
    _count: IngredientCountAggregateOutputType | null
    _avg: IngredientAvgAggregateOutputType | null
    _sum: IngredientSumAggregateOutputType | null
    _min: IngredientMinAggregateOutputType | null
    _max: IngredientMaxAggregateOutputType | null
  }

  type GetIngredientGroupByPayload<T extends IngredientGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IngredientGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IngredientGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IngredientGroupByOutputType[P]>
            : GetScalarType<T[P], IngredientGroupByOutputType[P]>
        }
      >
    >


  export type IngredientSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    ingredientCategoryId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ingredientCategory?: boolean | Ingredient$ingredientCategoryArgs<ExtArgs>
    recipeIngredients?: boolean | Ingredient$recipeIngredientsArgs<ExtArgs>
    _count?: boolean | IngredientCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ingredient"]>

  export type IngredientSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    ingredientCategoryId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ingredientCategory?: boolean | Ingredient$ingredientCategoryArgs<ExtArgs>
  }, ExtArgs["result"]["ingredient"]>

  export type IngredientSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    ingredientCategoryId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    ingredientCategory?: boolean | Ingredient$ingredientCategoryArgs<ExtArgs>
  }, ExtArgs["result"]["ingredient"]>

  export type IngredientSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    ingredientCategoryId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type IngredientOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "ingredientCategoryId" | "createdAt" | "updatedAt", ExtArgs["result"]["ingredient"]>
  export type IngredientInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ingredientCategory?: boolean | Ingredient$ingredientCategoryArgs<ExtArgs>
    recipeIngredients?: boolean | Ingredient$recipeIngredientsArgs<ExtArgs>
    _count?: boolean | IngredientCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type IngredientIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ingredientCategory?: boolean | Ingredient$ingredientCategoryArgs<ExtArgs>
  }
  export type IngredientIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    ingredientCategory?: boolean | Ingredient$ingredientCategoryArgs<ExtArgs>
  }

  export type $IngredientPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ingredient"
    objects: {
      ingredientCategory: Prisma.$IngredientCategoryPayload<ExtArgs> | null
      recipeIngredients: Prisma.$UnitQuantityPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
      ingredientCategoryId: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ingredient"]>
    composites: {}
  }

  type IngredientGetPayload<S extends boolean | null | undefined | IngredientDefaultArgs> = $Result.GetResult<Prisma.$IngredientPayload, S>

  type IngredientCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<IngredientFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: IngredientCountAggregateInputType | true
    }

  export interface IngredientDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ingredient'], meta: { name: 'Ingredient' } }
    /**
     * Find zero or one Ingredient that matches the filter.
     * @param {IngredientFindUniqueArgs} args - Arguments to find a Ingredient
     * @example
     * // Get one Ingredient
     * const ingredient = await prisma.ingredient.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IngredientFindUniqueArgs>(args: SelectSubset<T, IngredientFindUniqueArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ingredient that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {IngredientFindUniqueOrThrowArgs} args - Arguments to find a Ingredient
     * @example
     * // Get one Ingredient
     * const ingredient = await prisma.ingredient.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IngredientFindUniqueOrThrowArgs>(args: SelectSubset<T, IngredientFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredient that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientFindFirstArgs} args - Arguments to find a Ingredient
     * @example
     * // Get one Ingredient
     * const ingredient = await prisma.ingredient.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IngredientFindFirstArgs>(args?: SelectSubset<T, IngredientFindFirstArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ingredient that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientFindFirstOrThrowArgs} args - Arguments to find a Ingredient
     * @example
     * // Get one Ingredient
     * const ingredient = await prisma.ingredient.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IngredientFindFirstOrThrowArgs>(args?: SelectSubset<T, IngredientFindFirstOrThrowArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ingredients that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ingredients
     * const ingredients = await prisma.ingredient.findMany()
     * 
     * // Get first 10 Ingredients
     * const ingredients = await prisma.ingredient.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ingredientWithIdOnly = await prisma.ingredient.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IngredientFindManyArgs>(args?: SelectSubset<T, IngredientFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ingredient.
     * @param {IngredientCreateArgs} args - Arguments to create a Ingredient.
     * @example
     * // Create one Ingredient
     * const Ingredient = await prisma.ingredient.create({
     *   data: {
     *     // ... data to create a Ingredient
     *   }
     * })
     * 
     */
    create<T extends IngredientCreateArgs>(args: SelectSubset<T, IngredientCreateArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ingredients.
     * @param {IngredientCreateManyArgs} args - Arguments to create many Ingredients.
     * @example
     * // Create many Ingredients
     * const ingredient = await prisma.ingredient.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IngredientCreateManyArgs>(args?: SelectSubset<T, IngredientCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Ingredients and returns the data saved in the database.
     * @param {IngredientCreateManyAndReturnArgs} args - Arguments to create many Ingredients.
     * @example
     * // Create many Ingredients
     * const ingredient = await prisma.ingredient.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Ingredients and only return the `id`
     * const ingredientWithIdOnly = await prisma.ingredient.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IngredientCreateManyAndReturnArgs>(args?: SelectSubset<T, IngredientCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ingredient.
     * @param {IngredientDeleteArgs} args - Arguments to delete one Ingredient.
     * @example
     * // Delete one Ingredient
     * const Ingredient = await prisma.ingredient.delete({
     *   where: {
     *     // ... filter to delete one Ingredient
     *   }
     * })
     * 
     */
    delete<T extends IngredientDeleteArgs>(args: SelectSubset<T, IngredientDeleteArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ingredient.
     * @param {IngredientUpdateArgs} args - Arguments to update one Ingredient.
     * @example
     * // Update one Ingredient
     * const ingredient = await prisma.ingredient.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IngredientUpdateArgs>(args: SelectSubset<T, IngredientUpdateArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ingredients.
     * @param {IngredientDeleteManyArgs} args - Arguments to filter Ingredients to delete.
     * @example
     * // Delete a few Ingredients
     * const { count } = await prisma.ingredient.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IngredientDeleteManyArgs>(args?: SelectSubset<T, IngredientDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ingredients
     * const ingredient = await prisma.ingredient.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IngredientUpdateManyArgs>(args: SelectSubset<T, IngredientUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ingredients and returns the data updated in the database.
     * @param {IngredientUpdateManyAndReturnArgs} args - Arguments to update many Ingredients.
     * @example
     * // Update many Ingredients
     * const ingredient = await prisma.ingredient.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Ingredients and only return the `id`
     * const ingredientWithIdOnly = await prisma.ingredient.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends IngredientUpdateManyAndReturnArgs>(args: SelectSubset<T, IngredientUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ingredient.
     * @param {IngredientUpsertArgs} args - Arguments to update or create a Ingredient.
     * @example
     * // Update or create a Ingredient
     * const ingredient = await prisma.ingredient.upsert({
     *   create: {
     *     // ... data to create a Ingredient
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ingredient we want to update
     *   }
     * })
     */
    upsert<T extends IngredientUpsertArgs>(args: SelectSubset<T, IngredientUpsertArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ingredients.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientCountArgs} args - Arguments to filter Ingredients to count.
     * @example
     * // Count the number of Ingredients
     * const count = await prisma.ingredient.count({
     *   where: {
     *     // ... the filter for the Ingredients we want to count
     *   }
     * })
    **/
    count<T extends IngredientCountArgs>(
      args?: Subset<T, IngredientCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IngredientCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ingredient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IngredientAggregateArgs>(args: Subset<T, IngredientAggregateArgs>): Prisma.PrismaPromise<GetIngredientAggregateType<T>>

    /**
     * Group by Ingredient.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IngredientGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IngredientGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IngredientGroupByArgs['orderBy'] }
        : { orderBy?: IngredientGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IngredientGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIngredientGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ingredient model
   */
  readonly fields: IngredientFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ingredient.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IngredientClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    ingredientCategory<T extends Ingredient$ingredientCategoryArgs<ExtArgs> = {}>(args?: Subset<T, Ingredient$ingredientCategoryArgs<ExtArgs>>): Prisma__IngredientCategoryClient<$Result.GetResult<Prisma.$IngredientCategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    recipeIngredients<T extends Ingredient$recipeIngredientsArgs<ExtArgs> = {}>(args?: Subset<T, Ingredient$recipeIngredientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ingredient model
   */
  interface IngredientFieldRefs {
    readonly id: FieldRef<"Ingredient", 'Int'>
    readonly name: FieldRef<"Ingredient", 'String'>
    readonly description: FieldRef<"Ingredient", 'String'>
    readonly ingredientCategoryId: FieldRef<"Ingredient", 'Int'>
    readonly createdAt: FieldRef<"Ingredient", 'DateTime'>
    readonly updatedAt: FieldRef<"Ingredient", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Ingredient findUnique
   */
  export type IngredientFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * Filter, which Ingredient to fetch.
     */
    where: IngredientWhereUniqueInput
  }

  /**
   * Ingredient findUniqueOrThrow
   */
  export type IngredientFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * Filter, which Ingredient to fetch.
     */
    where: IngredientWhereUniqueInput
  }

  /**
   * Ingredient findFirst
   */
  export type IngredientFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * Filter, which Ingredient to fetch.
     */
    where?: IngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredients to fetch.
     */
    orderBy?: IngredientOrderByWithRelationInput | IngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ingredients.
     */
    cursor?: IngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ingredients.
     */
    distinct?: IngredientScalarFieldEnum | IngredientScalarFieldEnum[]
  }

  /**
   * Ingredient findFirstOrThrow
   */
  export type IngredientFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * Filter, which Ingredient to fetch.
     */
    where?: IngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredients to fetch.
     */
    orderBy?: IngredientOrderByWithRelationInput | IngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Ingredients.
     */
    cursor?: IngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredients.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Ingredients.
     */
    distinct?: IngredientScalarFieldEnum | IngredientScalarFieldEnum[]
  }

  /**
   * Ingredient findMany
   */
  export type IngredientFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * Filter, which Ingredients to fetch.
     */
    where?: IngredientWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Ingredients to fetch.
     */
    orderBy?: IngredientOrderByWithRelationInput | IngredientOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Ingredients.
     */
    cursor?: IngredientWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Ingredients from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Ingredients.
     */
    skip?: number
    distinct?: IngredientScalarFieldEnum | IngredientScalarFieldEnum[]
  }

  /**
   * Ingredient create
   */
  export type IngredientCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * The data needed to create a Ingredient.
     */
    data: XOR<IngredientCreateInput, IngredientUncheckedCreateInput>
  }

  /**
   * Ingredient createMany
   */
  export type IngredientCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Ingredients.
     */
    data: IngredientCreateManyInput | IngredientCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ingredient createManyAndReturn
   */
  export type IngredientCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * The data used to create many Ingredients.
     */
    data: IngredientCreateManyInput | IngredientCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ingredient update
   */
  export type IngredientUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * The data needed to update a Ingredient.
     */
    data: XOR<IngredientUpdateInput, IngredientUncheckedUpdateInput>
    /**
     * Choose, which Ingredient to update.
     */
    where: IngredientWhereUniqueInput
  }

  /**
   * Ingredient updateMany
   */
  export type IngredientUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Ingredients.
     */
    data: XOR<IngredientUpdateManyMutationInput, IngredientUncheckedUpdateManyInput>
    /**
     * Filter which Ingredients to update
     */
    where?: IngredientWhereInput
    /**
     * Limit how many Ingredients to update.
     */
    limit?: number
  }

  /**
   * Ingredient updateManyAndReturn
   */
  export type IngredientUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * The data used to update Ingredients.
     */
    data: XOR<IngredientUpdateManyMutationInput, IngredientUncheckedUpdateManyInput>
    /**
     * Filter which Ingredients to update
     */
    where?: IngredientWhereInput
    /**
     * Limit how many Ingredients to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ingredient upsert
   */
  export type IngredientUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * The filter to search for the Ingredient to update in case it exists.
     */
    where: IngredientWhereUniqueInput
    /**
     * In case the Ingredient found by the `where` argument doesn't exist, create a new Ingredient with this data.
     */
    create: XOR<IngredientCreateInput, IngredientUncheckedCreateInput>
    /**
     * In case the Ingredient was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IngredientUpdateInput, IngredientUncheckedUpdateInput>
  }

  /**
   * Ingredient delete
   */
  export type IngredientDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    /**
     * Filter which Ingredient to delete.
     */
    where: IngredientWhereUniqueInput
  }

  /**
   * Ingredient deleteMany
   */
  export type IngredientDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ingredients to delete
     */
    where?: IngredientWhereInput
    /**
     * Limit how many Ingredients to delete.
     */
    limit?: number
  }

  /**
   * Ingredient.ingredientCategory
   */
  export type Ingredient$ingredientCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IngredientCategory
     */
    select?: IngredientCategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the IngredientCategory
     */
    omit?: IngredientCategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientCategoryInclude<ExtArgs> | null
    where?: IngredientCategoryWhereInput
  }

  /**
   * Ingredient.recipeIngredients
   */
  export type Ingredient$recipeIngredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    where?: UnitQuantityWhereInput
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    cursor?: UnitQuantityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UnitQuantityScalarFieldEnum | UnitQuantityScalarFieldEnum[]
  }

  /**
   * Ingredient without action
   */
  export type IngredientDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
  }


  /**
   * Model Recipe
   */

  export type AggregateRecipe = {
    _count: RecipeCountAggregateOutputType | null
    _avg: RecipeAvgAggregateOutputType | null
    _sum: RecipeSumAggregateOutputType | null
    _min: RecipeMinAggregateOutputType | null
    _max: RecipeMaxAggregateOutputType | null
  }

  export type RecipeAvgAggregateOutputType = {
    id: number | null
    yieldQuantity: Decimal | null
    yieldUnitId: number | null
    prepTimeMinutes: number | null
    cookTimeMinutes: number | null
    categoryId: number | null
    userId: number | null
  }

  export type RecipeSumAggregateOutputType = {
    id: number | null
    yieldQuantity: Decimal | null
    yieldUnitId: number | null
    prepTimeMinutes: number | null
    cookTimeMinutes: number | null
    categoryId: number | null
    userId: number | null
  }

  export type RecipeMinAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    instructions: string | null
    yieldQuantity: Decimal | null
    yieldUnitId: number | null
    prepTimeMinutes: number | null
    cookTimeMinutes: number | null
    categoryId: number | null
    userId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecipeMaxAggregateOutputType = {
    id: number | null
    name: string | null
    description: string | null
    instructions: string | null
    yieldQuantity: Decimal | null
    yieldUnitId: number | null
    prepTimeMinutes: number | null
    cookTimeMinutes: number | null
    categoryId: number | null
    userId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RecipeCountAggregateOutputType = {
    id: number
    name: number
    description: number
    instructions: number
    yieldQuantity: number
    yieldUnitId: number
    prepTimeMinutes: number
    cookTimeMinutes: number
    tags: number
    categoryId: number
    userId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RecipeAvgAggregateInputType = {
    id?: true
    yieldQuantity?: true
    yieldUnitId?: true
    prepTimeMinutes?: true
    cookTimeMinutes?: true
    categoryId?: true
    userId?: true
  }

  export type RecipeSumAggregateInputType = {
    id?: true
    yieldQuantity?: true
    yieldUnitId?: true
    prepTimeMinutes?: true
    cookTimeMinutes?: true
    categoryId?: true
    userId?: true
  }

  export type RecipeMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    instructions?: true
    yieldQuantity?: true
    yieldUnitId?: true
    prepTimeMinutes?: true
    cookTimeMinutes?: true
    categoryId?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecipeMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    instructions?: true
    yieldQuantity?: true
    yieldUnitId?: true
    prepTimeMinutes?: true
    cookTimeMinutes?: true
    categoryId?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RecipeCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    instructions?: true
    yieldQuantity?: true
    yieldUnitId?: true
    prepTimeMinutes?: true
    cookTimeMinutes?: true
    tags?: true
    categoryId?: true
    userId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RecipeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Recipe to aggregate.
     */
    where?: RecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipeOrderByWithRelationInput | RecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Recipes
    **/
    _count?: true | RecipeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RecipeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RecipeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RecipeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RecipeMaxAggregateInputType
  }

  export type GetRecipeAggregateType<T extends RecipeAggregateArgs> = {
        [P in keyof T & keyof AggregateRecipe]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRecipe[P]>
      : GetScalarType<T[P], AggregateRecipe[P]>
  }




  export type RecipeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RecipeWhereInput
    orderBy?: RecipeOrderByWithAggregationInput | RecipeOrderByWithAggregationInput[]
    by: RecipeScalarFieldEnum[] | RecipeScalarFieldEnum
    having?: RecipeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RecipeCountAggregateInputType | true
    _avg?: RecipeAvgAggregateInputType
    _sum?: RecipeSumAggregateInputType
    _min?: RecipeMinAggregateInputType
    _max?: RecipeMaxAggregateInputType
  }

  export type RecipeGroupByOutputType = {
    id: number
    name: string
    description: string | null
    instructions: string
    yieldQuantity: Decimal | null
    yieldUnitId: number | null
    prepTimeMinutes: number | null
    cookTimeMinutes: number | null
    tags: string[]
    categoryId: number | null
    userId: number | null
    createdAt: Date
    updatedAt: Date
    _count: RecipeCountAggregateOutputType | null
    _avg: RecipeAvgAggregateOutputType | null
    _sum: RecipeSumAggregateOutputType | null
    _min: RecipeMinAggregateOutputType | null
    _max: RecipeMaxAggregateOutputType | null
  }

  type GetRecipeGroupByPayload<T extends RecipeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RecipeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RecipeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RecipeGroupByOutputType[P]>
            : GetScalarType<T[P], RecipeGroupByOutputType[P]>
        }
      >
    >


  export type RecipeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    instructions?: boolean
    yieldQuantity?: boolean
    yieldUnitId?: boolean
    prepTimeMinutes?: boolean
    cookTimeMinutes?: boolean
    tags?: boolean
    categoryId?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | Recipe$categoryArgs<ExtArgs>
    yieldUnit?: boolean | Recipe$yieldUnitArgs<ExtArgs>
    recipeIngredients?: boolean | Recipe$recipeIngredientsArgs<ExtArgs>
    usedAsSubRecipe?: boolean | Recipe$usedAsSubRecipeArgs<ExtArgs>
    author?: boolean | Recipe$authorArgs<ExtArgs>
    _count?: boolean | RecipeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["recipe"]>

  export type RecipeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    instructions?: boolean
    yieldQuantity?: boolean
    yieldUnitId?: boolean
    prepTimeMinutes?: boolean
    cookTimeMinutes?: boolean
    tags?: boolean
    categoryId?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | Recipe$categoryArgs<ExtArgs>
    yieldUnit?: boolean | Recipe$yieldUnitArgs<ExtArgs>
    author?: boolean | Recipe$authorArgs<ExtArgs>
  }, ExtArgs["result"]["recipe"]>

  export type RecipeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    instructions?: boolean
    yieldQuantity?: boolean
    yieldUnitId?: boolean
    prepTimeMinutes?: boolean
    cookTimeMinutes?: boolean
    tags?: boolean
    categoryId?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | Recipe$categoryArgs<ExtArgs>
    yieldUnit?: boolean | Recipe$yieldUnitArgs<ExtArgs>
    author?: boolean | Recipe$authorArgs<ExtArgs>
  }, ExtArgs["result"]["recipe"]>

  export type RecipeSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    instructions?: boolean
    yieldQuantity?: boolean
    yieldUnitId?: boolean
    prepTimeMinutes?: boolean
    cookTimeMinutes?: boolean
    tags?: boolean
    categoryId?: boolean
    userId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RecipeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "instructions" | "yieldQuantity" | "yieldUnitId" | "prepTimeMinutes" | "cookTimeMinutes" | "tags" | "categoryId" | "userId" | "createdAt" | "updatedAt", ExtArgs["result"]["recipe"]>
  export type RecipeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | Recipe$categoryArgs<ExtArgs>
    yieldUnit?: boolean | Recipe$yieldUnitArgs<ExtArgs>
    recipeIngredients?: boolean | Recipe$recipeIngredientsArgs<ExtArgs>
    usedAsSubRecipe?: boolean | Recipe$usedAsSubRecipeArgs<ExtArgs>
    author?: boolean | Recipe$authorArgs<ExtArgs>
    _count?: boolean | RecipeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RecipeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | Recipe$categoryArgs<ExtArgs>
    yieldUnit?: boolean | Recipe$yieldUnitArgs<ExtArgs>
    author?: boolean | Recipe$authorArgs<ExtArgs>
  }
  export type RecipeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | Recipe$categoryArgs<ExtArgs>
    yieldUnit?: boolean | Recipe$yieldUnitArgs<ExtArgs>
    author?: boolean | Recipe$authorArgs<ExtArgs>
  }

  export type $RecipePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Recipe"
    objects: {
      category: Prisma.$CategoryPayload<ExtArgs> | null
      yieldUnit: Prisma.$UnitOfMeasurePayload<ExtArgs> | null
      recipeIngredients: Prisma.$UnitQuantityPayload<ExtArgs>[]
      usedAsSubRecipe: Prisma.$UnitQuantityPayload<ExtArgs>[]
      author: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string
      description: string | null
      instructions: string
      yieldQuantity: Prisma.Decimal | null
      yieldUnitId: number | null
      prepTimeMinutes: number | null
      cookTimeMinutes: number | null
      tags: string[]
      categoryId: number | null
      userId: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["recipe"]>
    composites: {}
  }

  type RecipeGetPayload<S extends boolean | null | undefined | RecipeDefaultArgs> = $Result.GetResult<Prisma.$RecipePayload, S>

  type RecipeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RecipeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: RecipeCountAggregateInputType | true
    }

  export interface RecipeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Recipe'], meta: { name: 'Recipe' } }
    /**
     * Find zero or one Recipe that matches the filter.
     * @param {RecipeFindUniqueArgs} args - Arguments to find a Recipe
     * @example
     * // Get one Recipe
     * const recipe = await prisma.recipe.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecipeFindUniqueArgs>(args: SelectSubset<T, RecipeFindUniqueArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Recipe that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecipeFindUniqueOrThrowArgs} args - Arguments to find a Recipe
     * @example
     * // Get one Recipe
     * const recipe = await prisma.recipe.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecipeFindUniqueOrThrowArgs>(args: SelectSubset<T, RecipeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Recipe that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeFindFirstArgs} args - Arguments to find a Recipe
     * @example
     * // Get one Recipe
     * const recipe = await prisma.recipe.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecipeFindFirstArgs>(args?: SelectSubset<T, RecipeFindFirstArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Recipe that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeFindFirstOrThrowArgs} args - Arguments to find a Recipe
     * @example
     * // Get one Recipe
     * const recipe = await prisma.recipe.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecipeFindFirstOrThrowArgs>(args?: SelectSubset<T, RecipeFindFirstOrThrowArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Recipes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Recipes
     * const recipes = await prisma.recipe.findMany()
     * 
     * // Get first 10 Recipes
     * const recipes = await prisma.recipe.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const recipeWithIdOnly = await prisma.recipe.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RecipeFindManyArgs>(args?: SelectSubset<T, RecipeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Recipe.
     * @param {RecipeCreateArgs} args - Arguments to create a Recipe.
     * @example
     * // Create one Recipe
     * const Recipe = await prisma.recipe.create({
     *   data: {
     *     // ... data to create a Recipe
     *   }
     * })
     * 
     */
    create<T extends RecipeCreateArgs>(args: SelectSubset<T, RecipeCreateArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Recipes.
     * @param {RecipeCreateManyArgs} args - Arguments to create many Recipes.
     * @example
     * // Create many Recipes
     * const recipe = await prisma.recipe.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RecipeCreateManyArgs>(args?: SelectSubset<T, RecipeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Recipes and returns the data saved in the database.
     * @param {RecipeCreateManyAndReturnArgs} args - Arguments to create many Recipes.
     * @example
     * // Create many Recipes
     * const recipe = await prisma.recipe.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Recipes and only return the `id`
     * const recipeWithIdOnly = await prisma.recipe.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RecipeCreateManyAndReturnArgs>(args?: SelectSubset<T, RecipeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Recipe.
     * @param {RecipeDeleteArgs} args - Arguments to delete one Recipe.
     * @example
     * // Delete one Recipe
     * const Recipe = await prisma.recipe.delete({
     *   where: {
     *     // ... filter to delete one Recipe
     *   }
     * })
     * 
     */
    delete<T extends RecipeDeleteArgs>(args: SelectSubset<T, RecipeDeleteArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Recipe.
     * @param {RecipeUpdateArgs} args - Arguments to update one Recipe.
     * @example
     * // Update one Recipe
     * const recipe = await prisma.recipe.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RecipeUpdateArgs>(args: SelectSubset<T, RecipeUpdateArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Recipes.
     * @param {RecipeDeleteManyArgs} args - Arguments to filter Recipes to delete.
     * @example
     * // Delete a few Recipes
     * const { count } = await prisma.recipe.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RecipeDeleteManyArgs>(args?: SelectSubset<T, RecipeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Recipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Recipes
     * const recipe = await prisma.recipe.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RecipeUpdateManyArgs>(args: SelectSubset<T, RecipeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Recipes and returns the data updated in the database.
     * @param {RecipeUpdateManyAndReturnArgs} args - Arguments to update many Recipes.
     * @example
     * // Update many Recipes
     * const recipe = await prisma.recipe.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Recipes and only return the `id`
     * const recipeWithIdOnly = await prisma.recipe.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RecipeUpdateManyAndReturnArgs>(args: SelectSubset<T, RecipeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Recipe.
     * @param {RecipeUpsertArgs} args - Arguments to update or create a Recipe.
     * @example
     * // Update or create a Recipe
     * const recipe = await prisma.recipe.upsert({
     *   create: {
     *     // ... data to create a Recipe
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Recipe we want to update
     *   }
     * })
     */
    upsert<T extends RecipeUpsertArgs>(args: SelectSubset<T, RecipeUpsertArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Recipes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeCountArgs} args - Arguments to filter Recipes to count.
     * @example
     * // Count the number of Recipes
     * const count = await prisma.recipe.count({
     *   where: {
     *     // ... the filter for the Recipes we want to count
     *   }
     * })
    **/
    count<T extends RecipeCountArgs>(
      args?: Subset<T, RecipeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RecipeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Recipe.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecipeAggregateArgs>(args: Subset<T, RecipeAggregateArgs>): Prisma.PrismaPromise<GetRecipeAggregateType<T>>

    /**
     * Group by Recipe.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecipeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RecipeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RecipeGroupByArgs['orderBy'] }
        : { orderBy?: RecipeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RecipeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecipeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Recipe model
   */
  readonly fields: RecipeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Recipe.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RecipeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends Recipe$categoryArgs<ExtArgs> = {}>(args?: Subset<T, Recipe$categoryArgs<ExtArgs>>): Prisma__CategoryClient<$Result.GetResult<Prisma.$CategoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    yieldUnit<T extends Recipe$yieldUnitArgs<ExtArgs> = {}>(args?: Subset<T, Recipe$yieldUnitArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    recipeIngredients<T extends Recipe$recipeIngredientsArgs<ExtArgs> = {}>(args?: Subset<T, Recipe$recipeIngredientsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    usedAsSubRecipe<T extends Recipe$usedAsSubRecipeArgs<ExtArgs> = {}>(args?: Subset<T, Recipe$usedAsSubRecipeArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    author<T extends Recipe$authorArgs<ExtArgs> = {}>(args?: Subset<T, Recipe$authorArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Recipe model
   */
  interface RecipeFieldRefs {
    readonly id: FieldRef<"Recipe", 'Int'>
    readonly name: FieldRef<"Recipe", 'String'>
    readonly description: FieldRef<"Recipe", 'String'>
    readonly instructions: FieldRef<"Recipe", 'String'>
    readonly yieldQuantity: FieldRef<"Recipe", 'Decimal'>
    readonly yieldUnitId: FieldRef<"Recipe", 'Int'>
    readonly prepTimeMinutes: FieldRef<"Recipe", 'Int'>
    readonly cookTimeMinutes: FieldRef<"Recipe", 'Int'>
    readonly tags: FieldRef<"Recipe", 'String[]'>
    readonly categoryId: FieldRef<"Recipe", 'Int'>
    readonly userId: FieldRef<"Recipe", 'Int'>
    readonly createdAt: FieldRef<"Recipe", 'DateTime'>
    readonly updatedAt: FieldRef<"Recipe", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Recipe findUnique
   */
  export type RecipeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * Filter, which Recipe to fetch.
     */
    where: RecipeWhereUniqueInput
  }

  /**
   * Recipe findUniqueOrThrow
   */
  export type RecipeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * Filter, which Recipe to fetch.
     */
    where: RecipeWhereUniqueInput
  }

  /**
   * Recipe findFirst
   */
  export type RecipeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * Filter, which Recipe to fetch.
     */
    where?: RecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipeOrderByWithRelationInput | RecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Recipes.
     */
    cursor?: RecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Recipes.
     */
    distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[]
  }

  /**
   * Recipe findFirstOrThrow
   */
  export type RecipeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * Filter, which Recipe to fetch.
     */
    where?: RecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipeOrderByWithRelationInput | RecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Recipes.
     */
    cursor?: RecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Recipes.
     */
    distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[]
  }

  /**
   * Recipe findMany
   */
  export type RecipeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * Filter, which Recipes to fetch.
     */
    where?: RecipeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Recipes to fetch.
     */
    orderBy?: RecipeOrderByWithRelationInput | RecipeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Recipes.
     */
    cursor?: RecipeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Recipes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Recipes.
     */
    skip?: number
    distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[]
  }

  /**
   * Recipe create
   */
  export type RecipeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * The data needed to create a Recipe.
     */
    data: XOR<RecipeCreateInput, RecipeUncheckedCreateInput>
  }

  /**
   * Recipe createMany
   */
  export type RecipeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Recipes.
     */
    data: RecipeCreateManyInput | RecipeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Recipe createManyAndReturn
   */
  export type RecipeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * The data used to create many Recipes.
     */
    data: RecipeCreateManyInput | RecipeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Recipe update
   */
  export type RecipeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * The data needed to update a Recipe.
     */
    data: XOR<RecipeUpdateInput, RecipeUncheckedUpdateInput>
    /**
     * Choose, which Recipe to update.
     */
    where: RecipeWhereUniqueInput
  }

  /**
   * Recipe updateMany
   */
  export type RecipeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Recipes.
     */
    data: XOR<RecipeUpdateManyMutationInput, RecipeUncheckedUpdateManyInput>
    /**
     * Filter which Recipes to update
     */
    where?: RecipeWhereInput
    /**
     * Limit how many Recipes to update.
     */
    limit?: number
  }

  /**
   * Recipe updateManyAndReturn
   */
  export type RecipeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * The data used to update Recipes.
     */
    data: XOR<RecipeUpdateManyMutationInput, RecipeUncheckedUpdateManyInput>
    /**
     * Filter which Recipes to update
     */
    where?: RecipeWhereInput
    /**
     * Limit how many Recipes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Recipe upsert
   */
  export type RecipeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * The filter to search for the Recipe to update in case it exists.
     */
    where: RecipeWhereUniqueInput
    /**
     * In case the Recipe found by the `where` argument doesn't exist, create a new Recipe with this data.
     */
    create: XOR<RecipeCreateInput, RecipeUncheckedCreateInput>
    /**
     * In case the Recipe was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RecipeUpdateInput, RecipeUncheckedUpdateInput>
  }

  /**
   * Recipe delete
   */
  export type RecipeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    /**
     * Filter which Recipe to delete.
     */
    where: RecipeWhereUniqueInput
  }

  /**
   * Recipe deleteMany
   */
  export type RecipeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Recipes to delete
     */
    where?: RecipeWhereInput
    /**
     * Limit how many Recipes to delete.
     */
    limit?: number
  }

  /**
   * Recipe.category
   */
  export type Recipe$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Category
     */
    select?: CategorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the Category
     */
    omit?: CategoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CategoryInclude<ExtArgs> | null
    where?: CategoryWhereInput
  }

  /**
   * Recipe.yieldUnit
   */
  export type Recipe$yieldUnitArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitOfMeasure
     */
    select?: UnitOfMeasureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitOfMeasure
     */
    omit?: UnitOfMeasureOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitOfMeasureInclude<ExtArgs> | null
    where?: UnitOfMeasureWhereInput
  }

  /**
   * Recipe.recipeIngredients
   */
  export type Recipe$recipeIngredientsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    where?: UnitQuantityWhereInput
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    cursor?: UnitQuantityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UnitQuantityScalarFieldEnum | UnitQuantityScalarFieldEnum[]
  }

  /**
   * Recipe.usedAsSubRecipe
   */
  export type Recipe$usedAsSubRecipeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    where?: UnitQuantityWhereInput
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    cursor?: UnitQuantityWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UnitQuantityScalarFieldEnum | UnitQuantityScalarFieldEnum[]
  }

  /**
   * Recipe.author
   */
  export type Recipe$authorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * Recipe without action
   */
  export type RecipeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
  }


  /**
   * Model UnitQuantity
   */

  export type AggregateUnitQuantity = {
    _count: UnitQuantityCountAggregateOutputType | null
    _avg: UnitQuantityAvgAggregateOutputType | null
    _sum: UnitQuantitySumAggregateOutputType | null
    _min: UnitQuantityMinAggregateOutputType | null
    _max: UnitQuantityMaxAggregateOutputType | null
  }

  export type UnitQuantityAvgAggregateOutputType = {
    id: number | null
    recipeId: number | null
    ingredientId: number | null
    subRecipeId: number | null
    quantity: Decimal | null
    unitId: number | null
    order: number | null
  }

  export type UnitQuantitySumAggregateOutputType = {
    id: number | null
    recipeId: number | null
    ingredientId: number | null
    subRecipeId: number | null
    quantity: Decimal | null
    unitId: number | null
    order: number | null
  }

  export type UnitQuantityMinAggregateOutputType = {
    id: number | null
    recipeId: number | null
    ingredientId: number | null
    subRecipeId: number | null
    quantity: Decimal | null
    unitId: number | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UnitQuantityMaxAggregateOutputType = {
    id: number | null
    recipeId: number | null
    ingredientId: number | null
    subRecipeId: number | null
    quantity: Decimal | null
    unitId: number | null
    order: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UnitQuantityCountAggregateOutputType = {
    id: number
    recipeId: number
    ingredientId: number
    subRecipeId: number
    quantity: number
    unitId: number
    order: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UnitQuantityAvgAggregateInputType = {
    id?: true
    recipeId?: true
    ingredientId?: true
    subRecipeId?: true
    quantity?: true
    unitId?: true
    order?: true
  }

  export type UnitQuantitySumAggregateInputType = {
    id?: true
    recipeId?: true
    ingredientId?: true
    subRecipeId?: true
    quantity?: true
    unitId?: true
    order?: true
  }

  export type UnitQuantityMinAggregateInputType = {
    id?: true
    recipeId?: true
    ingredientId?: true
    subRecipeId?: true
    quantity?: true
    unitId?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UnitQuantityMaxAggregateInputType = {
    id?: true
    recipeId?: true
    ingredientId?: true
    subRecipeId?: true
    quantity?: true
    unitId?: true
    order?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UnitQuantityCountAggregateInputType = {
    id?: true
    recipeId?: true
    ingredientId?: true
    subRecipeId?: true
    quantity?: true
    unitId?: true
    order?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UnitQuantityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UnitQuantity to aggregate.
     */
    where?: UnitQuantityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitQuantities to fetch.
     */
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UnitQuantityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitQuantities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitQuantities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UnitQuantities
    **/
    _count?: true | UnitQuantityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UnitQuantityAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UnitQuantitySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UnitQuantityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UnitQuantityMaxAggregateInputType
  }

  export type GetUnitQuantityAggregateType<T extends UnitQuantityAggregateArgs> = {
        [P in keyof T & keyof AggregateUnitQuantity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUnitQuantity[P]>
      : GetScalarType<T[P], AggregateUnitQuantity[P]>
  }




  export type UnitQuantityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UnitQuantityWhereInput
    orderBy?: UnitQuantityOrderByWithAggregationInput | UnitQuantityOrderByWithAggregationInput[]
    by: UnitQuantityScalarFieldEnum[] | UnitQuantityScalarFieldEnum
    having?: UnitQuantityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UnitQuantityCountAggregateInputType | true
    _avg?: UnitQuantityAvgAggregateInputType
    _sum?: UnitQuantitySumAggregateInputType
    _min?: UnitQuantityMinAggregateInputType
    _max?: UnitQuantityMaxAggregateInputType
  }

  export type UnitQuantityGroupByOutputType = {
    id: number
    recipeId: number
    ingredientId: number | null
    subRecipeId: number | null
    quantity: Decimal
    unitId: number
    order: number
    createdAt: Date
    updatedAt: Date
    _count: UnitQuantityCountAggregateOutputType | null
    _avg: UnitQuantityAvgAggregateOutputType | null
    _sum: UnitQuantitySumAggregateOutputType | null
    _min: UnitQuantityMinAggregateOutputType | null
    _max: UnitQuantityMaxAggregateOutputType | null
  }

  type GetUnitQuantityGroupByPayload<T extends UnitQuantityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UnitQuantityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UnitQuantityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UnitQuantityGroupByOutputType[P]>
            : GetScalarType<T[P], UnitQuantityGroupByOutputType[P]>
        }
      >
    >


  export type UnitQuantitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recipeId?: boolean
    ingredientId?: boolean
    subRecipeId?: boolean
    quantity?: boolean
    unitId?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    recipe?: boolean | RecipeDefaultArgs<ExtArgs>
    ingredient?: boolean | UnitQuantity$ingredientArgs<ExtArgs>
    subRecipe?: boolean | UnitQuantity$subRecipeArgs<ExtArgs>
    unit?: boolean | UnitOfMeasureDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unitQuantity"]>

  export type UnitQuantitySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recipeId?: boolean
    ingredientId?: boolean
    subRecipeId?: boolean
    quantity?: boolean
    unitId?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    recipe?: boolean | RecipeDefaultArgs<ExtArgs>
    ingredient?: boolean | UnitQuantity$ingredientArgs<ExtArgs>
    subRecipe?: boolean | UnitQuantity$subRecipeArgs<ExtArgs>
    unit?: boolean | UnitOfMeasureDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unitQuantity"]>

  export type UnitQuantitySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    recipeId?: boolean
    ingredientId?: boolean
    subRecipeId?: boolean
    quantity?: boolean
    unitId?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    recipe?: boolean | RecipeDefaultArgs<ExtArgs>
    ingredient?: boolean | UnitQuantity$ingredientArgs<ExtArgs>
    subRecipe?: boolean | UnitQuantity$subRecipeArgs<ExtArgs>
    unit?: boolean | UnitOfMeasureDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["unitQuantity"]>

  export type UnitQuantitySelectScalar = {
    id?: boolean
    recipeId?: boolean
    ingredientId?: boolean
    subRecipeId?: boolean
    quantity?: boolean
    unitId?: boolean
    order?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UnitQuantityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "recipeId" | "ingredientId" | "subRecipeId" | "quantity" | "unitId" | "order" | "createdAt" | "updatedAt", ExtArgs["result"]["unitQuantity"]>
  export type UnitQuantityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe?: boolean | RecipeDefaultArgs<ExtArgs>
    ingredient?: boolean | UnitQuantity$ingredientArgs<ExtArgs>
    subRecipe?: boolean | UnitQuantity$subRecipeArgs<ExtArgs>
    unit?: boolean | UnitOfMeasureDefaultArgs<ExtArgs>
  }
  export type UnitQuantityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe?: boolean | RecipeDefaultArgs<ExtArgs>
    ingredient?: boolean | UnitQuantity$ingredientArgs<ExtArgs>
    subRecipe?: boolean | UnitQuantity$subRecipeArgs<ExtArgs>
    unit?: boolean | UnitOfMeasureDefaultArgs<ExtArgs>
  }
  export type UnitQuantityIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipe?: boolean | RecipeDefaultArgs<ExtArgs>
    ingredient?: boolean | UnitQuantity$ingredientArgs<ExtArgs>
    subRecipe?: boolean | UnitQuantity$subRecipeArgs<ExtArgs>
    unit?: boolean | UnitOfMeasureDefaultArgs<ExtArgs>
  }

  export type $UnitQuantityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UnitQuantity"
    objects: {
      recipe: Prisma.$RecipePayload<ExtArgs>
      ingredient: Prisma.$IngredientPayload<ExtArgs> | null
      subRecipe: Prisma.$RecipePayload<ExtArgs> | null
      unit: Prisma.$UnitOfMeasurePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      recipeId: number
      ingredientId: number | null
      subRecipeId: number | null
      quantity: Prisma.Decimal
      unitId: number
      order: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["unitQuantity"]>
    composites: {}
  }

  type UnitQuantityGetPayload<S extends boolean | null | undefined | UnitQuantityDefaultArgs> = $Result.GetResult<Prisma.$UnitQuantityPayload, S>

  type UnitQuantityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UnitQuantityFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UnitQuantityCountAggregateInputType | true
    }

  export interface UnitQuantityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UnitQuantity'], meta: { name: 'UnitQuantity' } }
    /**
     * Find zero or one UnitQuantity that matches the filter.
     * @param {UnitQuantityFindUniqueArgs} args - Arguments to find a UnitQuantity
     * @example
     * // Get one UnitQuantity
     * const unitQuantity = await prisma.unitQuantity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UnitQuantityFindUniqueArgs>(args: SelectSubset<T, UnitQuantityFindUniqueArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UnitQuantity that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UnitQuantityFindUniqueOrThrowArgs} args - Arguments to find a UnitQuantity
     * @example
     * // Get one UnitQuantity
     * const unitQuantity = await prisma.unitQuantity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UnitQuantityFindUniqueOrThrowArgs>(args: SelectSubset<T, UnitQuantityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UnitQuantity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitQuantityFindFirstArgs} args - Arguments to find a UnitQuantity
     * @example
     * // Get one UnitQuantity
     * const unitQuantity = await prisma.unitQuantity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UnitQuantityFindFirstArgs>(args?: SelectSubset<T, UnitQuantityFindFirstArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UnitQuantity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitQuantityFindFirstOrThrowArgs} args - Arguments to find a UnitQuantity
     * @example
     * // Get one UnitQuantity
     * const unitQuantity = await prisma.unitQuantity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UnitQuantityFindFirstOrThrowArgs>(args?: SelectSubset<T, UnitQuantityFindFirstOrThrowArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UnitQuantities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitQuantityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UnitQuantities
     * const unitQuantities = await prisma.unitQuantity.findMany()
     * 
     * // Get first 10 UnitQuantities
     * const unitQuantities = await prisma.unitQuantity.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const unitQuantityWithIdOnly = await prisma.unitQuantity.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UnitQuantityFindManyArgs>(args?: SelectSubset<T, UnitQuantityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UnitQuantity.
     * @param {UnitQuantityCreateArgs} args - Arguments to create a UnitQuantity.
     * @example
     * // Create one UnitQuantity
     * const UnitQuantity = await prisma.unitQuantity.create({
     *   data: {
     *     // ... data to create a UnitQuantity
     *   }
     * })
     * 
     */
    create<T extends UnitQuantityCreateArgs>(args: SelectSubset<T, UnitQuantityCreateArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UnitQuantities.
     * @param {UnitQuantityCreateManyArgs} args - Arguments to create many UnitQuantities.
     * @example
     * // Create many UnitQuantities
     * const unitQuantity = await prisma.unitQuantity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UnitQuantityCreateManyArgs>(args?: SelectSubset<T, UnitQuantityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UnitQuantities and returns the data saved in the database.
     * @param {UnitQuantityCreateManyAndReturnArgs} args - Arguments to create many UnitQuantities.
     * @example
     * // Create many UnitQuantities
     * const unitQuantity = await prisma.unitQuantity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UnitQuantities and only return the `id`
     * const unitQuantityWithIdOnly = await prisma.unitQuantity.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UnitQuantityCreateManyAndReturnArgs>(args?: SelectSubset<T, UnitQuantityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UnitQuantity.
     * @param {UnitQuantityDeleteArgs} args - Arguments to delete one UnitQuantity.
     * @example
     * // Delete one UnitQuantity
     * const UnitQuantity = await prisma.unitQuantity.delete({
     *   where: {
     *     // ... filter to delete one UnitQuantity
     *   }
     * })
     * 
     */
    delete<T extends UnitQuantityDeleteArgs>(args: SelectSubset<T, UnitQuantityDeleteArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UnitQuantity.
     * @param {UnitQuantityUpdateArgs} args - Arguments to update one UnitQuantity.
     * @example
     * // Update one UnitQuantity
     * const unitQuantity = await prisma.unitQuantity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UnitQuantityUpdateArgs>(args: SelectSubset<T, UnitQuantityUpdateArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UnitQuantities.
     * @param {UnitQuantityDeleteManyArgs} args - Arguments to filter UnitQuantities to delete.
     * @example
     * // Delete a few UnitQuantities
     * const { count } = await prisma.unitQuantity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UnitQuantityDeleteManyArgs>(args?: SelectSubset<T, UnitQuantityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UnitQuantities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitQuantityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UnitQuantities
     * const unitQuantity = await prisma.unitQuantity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UnitQuantityUpdateManyArgs>(args: SelectSubset<T, UnitQuantityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UnitQuantities and returns the data updated in the database.
     * @param {UnitQuantityUpdateManyAndReturnArgs} args - Arguments to update many UnitQuantities.
     * @example
     * // Update many UnitQuantities
     * const unitQuantity = await prisma.unitQuantity.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UnitQuantities and only return the `id`
     * const unitQuantityWithIdOnly = await prisma.unitQuantity.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UnitQuantityUpdateManyAndReturnArgs>(args: SelectSubset<T, UnitQuantityUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UnitQuantity.
     * @param {UnitQuantityUpsertArgs} args - Arguments to update or create a UnitQuantity.
     * @example
     * // Update or create a UnitQuantity
     * const unitQuantity = await prisma.unitQuantity.upsert({
     *   create: {
     *     // ... data to create a UnitQuantity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UnitQuantity we want to update
     *   }
     * })
     */
    upsert<T extends UnitQuantityUpsertArgs>(args: SelectSubset<T, UnitQuantityUpsertArgs<ExtArgs>>): Prisma__UnitQuantityClient<$Result.GetResult<Prisma.$UnitQuantityPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UnitQuantities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitQuantityCountArgs} args - Arguments to filter UnitQuantities to count.
     * @example
     * // Count the number of UnitQuantities
     * const count = await prisma.unitQuantity.count({
     *   where: {
     *     // ... the filter for the UnitQuantities we want to count
     *   }
     * })
    **/
    count<T extends UnitQuantityCountArgs>(
      args?: Subset<T, UnitQuantityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UnitQuantityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UnitQuantity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitQuantityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UnitQuantityAggregateArgs>(args: Subset<T, UnitQuantityAggregateArgs>): Prisma.PrismaPromise<GetUnitQuantityAggregateType<T>>

    /**
     * Group by UnitQuantity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UnitQuantityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UnitQuantityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UnitQuantityGroupByArgs['orderBy'] }
        : { orderBy?: UnitQuantityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UnitQuantityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUnitQuantityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UnitQuantity model
   */
  readonly fields: UnitQuantityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UnitQuantity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UnitQuantityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recipe<T extends RecipeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RecipeDefaultArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    ingredient<T extends UnitQuantity$ingredientArgs<ExtArgs> = {}>(args?: Subset<T, UnitQuantity$ingredientArgs<ExtArgs>>): Prisma__IngredientClient<$Result.GetResult<Prisma.$IngredientPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    subRecipe<T extends UnitQuantity$subRecipeArgs<ExtArgs> = {}>(args?: Subset<T, UnitQuantity$subRecipeArgs<ExtArgs>>): Prisma__RecipeClient<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    unit<T extends UnitOfMeasureDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UnitOfMeasureDefaultArgs<ExtArgs>>): Prisma__UnitOfMeasureClient<$Result.GetResult<Prisma.$UnitOfMeasurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UnitQuantity model
   */
  interface UnitQuantityFieldRefs {
    readonly id: FieldRef<"UnitQuantity", 'Int'>
    readonly recipeId: FieldRef<"UnitQuantity", 'Int'>
    readonly ingredientId: FieldRef<"UnitQuantity", 'Int'>
    readonly subRecipeId: FieldRef<"UnitQuantity", 'Int'>
    readonly quantity: FieldRef<"UnitQuantity", 'Decimal'>
    readonly unitId: FieldRef<"UnitQuantity", 'Int'>
    readonly order: FieldRef<"UnitQuantity", 'Int'>
    readonly createdAt: FieldRef<"UnitQuantity", 'DateTime'>
    readonly updatedAt: FieldRef<"UnitQuantity", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UnitQuantity findUnique
   */
  export type UnitQuantityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * Filter, which UnitQuantity to fetch.
     */
    where: UnitQuantityWhereUniqueInput
  }

  /**
   * UnitQuantity findUniqueOrThrow
   */
  export type UnitQuantityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * Filter, which UnitQuantity to fetch.
     */
    where: UnitQuantityWhereUniqueInput
  }

  /**
   * UnitQuantity findFirst
   */
  export type UnitQuantityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * Filter, which UnitQuantity to fetch.
     */
    where?: UnitQuantityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitQuantities to fetch.
     */
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UnitQuantities.
     */
    cursor?: UnitQuantityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitQuantities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitQuantities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UnitQuantities.
     */
    distinct?: UnitQuantityScalarFieldEnum | UnitQuantityScalarFieldEnum[]
  }

  /**
   * UnitQuantity findFirstOrThrow
   */
  export type UnitQuantityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * Filter, which UnitQuantity to fetch.
     */
    where?: UnitQuantityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitQuantities to fetch.
     */
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UnitQuantities.
     */
    cursor?: UnitQuantityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitQuantities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitQuantities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UnitQuantities.
     */
    distinct?: UnitQuantityScalarFieldEnum | UnitQuantityScalarFieldEnum[]
  }

  /**
   * UnitQuantity findMany
   */
  export type UnitQuantityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * Filter, which UnitQuantities to fetch.
     */
    where?: UnitQuantityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UnitQuantities to fetch.
     */
    orderBy?: UnitQuantityOrderByWithRelationInput | UnitQuantityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UnitQuantities.
     */
    cursor?: UnitQuantityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UnitQuantities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UnitQuantities.
     */
    skip?: number
    distinct?: UnitQuantityScalarFieldEnum | UnitQuantityScalarFieldEnum[]
  }

  /**
   * UnitQuantity create
   */
  export type UnitQuantityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * The data needed to create a UnitQuantity.
     */
    data: XOR<UnitQuantityCreateInput, UnitQuantityUncheckedCreateInput>
  }

  /**
   * UnitQuantity createMany
   */
  export type UnitQuantityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UnitQuantities.
     */
    data: UnitQuantityCreateManyInput | UnitQuantityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UnitQuantity createManyAndReturn
   */
  export type UnitQuantityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * The data used to create many UnitQuantities.
     */
    data: UnitQuantityCreateManyInput | UnitQuantityCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UnitQuantity update
   */
  export type UnitQuantityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * The data needed to update a UnitQuantity.
     */
    data: XOR<UnitQuantityUpdateInput, UnitQuantityUncheckedUpdateInput>
    /**
     * Choose, which UnitQuantity to update.
     */
    where: UnitQuantityWhereUniqueInput
  }

  /**
   * UnitQuantity updateMany
   */
  export type UnitQuantityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UnitQuantities.
     */
    data: XOR<UnitQuantityUpdateManyMutationInput, UnitQuantityUncheckedUpdateManyInput>
    /**
     * Filter which UnitQuantities to update
     */
    where?: UnitQuantityWhereInput
    /**
     * Limit how many UnitQuantities to update.
     */
    limit?: number
  }

  /**
   * UnitQuantity updateManyAndReturn
   */
  export type UnitQuantityUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * The data used to update UnitQuantities.
     */
    data: XOR<UnitQuantityUpdateManyMutationInput, UnitQuantityUncheckedUpdateManyInput>
    /**
     * Filter which UnitQuantities to update
     */
    where?: UnitQuantityWhereInput
    /**
     * Limit how many UnitQuantities to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UnitQuantity upsert
   */
  export type UnitQuantityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * The filter to search for the UnitQuantity to update in case it exists.
     */
    where: UnitQuantityWhereUniqueInput
    /**
     * In case the UnitQuantity found by the `where` argument doesn't exist, create a new UnitQuantity with this data.
     */
    create: XOR<UnitQuantityCreateInput, UnitQuantityUncheckedCreateInput>
    /**
     * In case the UnitQuantity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UnitQuantityUpdateInput, UnitQuantityUncheckedUpdateInput>
  }

  /**
   * UnitQuantity delete
   */
  export type UnitQuantityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
    /**
     * Filter which UnitQuantity to delete.
     */
    where: UnitQuantityWhereUniqueInput
  }

  /**
   * UnitQuantity deleteMany
   */
  export type UnitQuantityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UnitQuantities to delete
     */
    where?: UnitQuantityWhereInput
    /**
     * Limit how many UnitQuantities to delete.
     */
    limit?: number
  }

  /**
   * UnitQuantity.ingredient
   */
  export type UnitQuantity$ingredientArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ingredient
     */
    select?: IngredientSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ingredient
     */
    omit?: IngredientOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: IngredientInclude<ExtArgs> | null
    where?: IngredientWhereInput
  }

  /**
   * UnitQuantity.subRecipe
   */
  export type UnitQuantity$subRecipeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    where?: RecipeWhereInput
  }

  /**
   * UnitQuantity without action
   */
  export type UnitQuantityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UnitQuantity
     */
    select?: UnitQuantitySelect<ExtArgs> | null
    /**
     * Omit specific fields from the UnitQuantity
     */
    omit?: UnitQuantityOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UnitQuantityInclude<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    email: string | null
    name: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    email: string | null
    name: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    name: number
    password: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    name?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    email: string
    name: string | null
    password: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    recipes?: boolean | User$recipesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    email?: boolean
    name?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "name" | "password" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    recipes?: boolean | User$recipesArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      recipes: Prisma.$RecipePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      email: string
      name: string | null
      password: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    recipes<T extends User$recipesArgs<ExtArgs> = {}>(args?: Subset<T, User$recipesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RecipePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly email: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.recipes
   */
  export type User$recipesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Recipe
     */
    select?: RecipeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Recipe
     */
    omit?: RecipeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RecipeInclude<ExtArgs> | null
    where?: RecipeWhereInput
    orderBy?: RecipeOrderByWithRelationInput | RecipeOrderByWithRelationInput[]
    cursor?: RecipeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RecipeScalarFieldEnum | RecipeScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const CategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CategoryScalarFieldEnum = (typeof CategoryScalarFieldEnum)[keyof typeof CategoryScalarFieldEnum]


  export const IngredientCategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type IngredientCategoryScalarFieldEnum = (typeof IngredientCategoryScalarFieldEnum)[keyof typeof IngredientCategoryScalarFieldEnum]


  export const UnitOfMeasureScalarFieldEnum: {
    id: 'id',
    name: 'name',
    abbreviation: 'abbreviation',
    type: 'type',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UnitOfMeasureScalarFieldEnum = (typeof UnitOfMeasureScalarFieldEnum)[keyof typeof UnitOfMeasureScalarFieldEnum]


  export const IngredientScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    ingredientCategoryId: 'ingredientCategoryId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type IngredientScalarFieldEnum = (typeof IngredientScalarFieldEnum)[keyof typeof IngredientScalarFieldEnum]


  export const RecipeScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    instructions: 'instructions',
    yieldQuantity: 'yieldQuantity',
    yieldUnitId: 'yieldUnitId',
    prepTimeMinutes: 'prepTimeMinutes',
    cookTimeMinutes: 'cookTimeMinutes',
    tags: 'tags',
    categoryId: 'categoryId',
    userId: 'userId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RecipeScalarFieldEnum = (typeof RecipeScalarFieldEnum)[keyof typeof RecipeScalarFieldEnum]


  export const UnitQuantityScalarFieldEnum: {
    id: 'id',
    recipeId: 'recipeId',
    ingredientId: 'ingredientId',
    subRecipeId: 'subRecipeId',
    quantity: 'quantity',
    unitId: 'unitId',
    order: 'order',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UnitQuantityScalarFieldEnum = (typeof UnitQuantityScalarFieldEnum)[keyof typeof UnitQuantityScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    name: 'name',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'UnitType'
   */
  export type EnumUnitTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UnitType'>
    


  /**
   * Reference to a field of type 'UnitType[]'
   */
  export type ListEnumUnitTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UnitType[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type CategoryWhereInput = {
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    id?: IntFilter<"Category"> | number
    name?: StringFilter<"Category"> | string
    description?: StringNullableFilter<"Category"> | string | null
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    recipes?: RecipeListRelationFilter
  }

  export type CategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    recipes?: RecipeOrderByRelationAggregateInput
  }

  export type CategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: CategoryWhereInput | CategoryWhereInput[]
    OR?: CategoryWhereInput[]
    NOT?: CategoryWhereInput | CategoryWhereInput[]
    description?: StringNullableFilter<"Category"> | string | null
    createdAt?: DateTimeFilter<"Category"> | Date | string
    updatedAt?: DateTimeFilter<"Category"> | Date | string
    recipes?: RecipeListRelationFilter
  }, "id" | "name">

  export type CategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CategoryCountOrderByAggregateInput
    _avg?: CategoryAvgOrderByAggregateInput
    _max?: CategoryMaxOrderByAggregateInput
    _min?: CategoryMinOrderByAggregateInput
    _sum?: CategorySumOrderByAggregateInput
  }

  export type CategoryScalarWhereWithAggregatesInput = {
    AND?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    OR?: CategoryScalarWhereWithAggregatesInput[]
    NOT?: CategoryScalarWhereWithAggregatesInput | CategoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Category"> | number
    name?: StringWithAggregatesFilter<"Category"> | string
    description?: StringNullableWithAggregatesFilter<"Category"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Category"> | Date | string
  }

  export type IngredientCategoryWhereInput = {
    AND?: IngredientCategoryWhereInput | IngredientCategoryWhereInput[]
    OR?: IngredientCategoryWhereInput[]
    NOT?: IngredientCategoryWhereInput | IngredientCategoryWhereInput[]
    id?: IntFilter<"IngredientCategory"> | number
    name?: StringFilter<"IngredientCategory"> | string
    description?: StringNullableFilter<"IngredientCategory"> | string | null
    createdAt?: DateTimeFilter<"IngredientCategory"> | Date | string
    updatedAt?: DateTimeFilter<"IngredientCategory"> | Date | string
    ingredients?: IngredientListRelationFilter
  }

  export type IngredientCategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ingredients?: IngredientOrderByRelationAggregateInput
  }

  export type IngredientCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: IngredientCategoryWhereInput | IngredientCategoryWhereInput[]
    OR?: IngredientCategoryWhereInput[]
    NOT?: IngredientCategoryWhereInput | IngredientCategoryWhereInput[]
    description?: StringNullableFilter<"IngredientCategory"> | string | null
    createdAt?: DateTimeFilter<"IngredientCategory"> | Date | string
    updatedAt?: DateTimeFilter<"IngredientCategory"> | Date | string
    ingredients?: IngredientListRelationFilter
  }, "id" | "name">

  export type IngredientCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: IngredientCategoryCountOrderByAggregateInput
    _avg?: IngredientCategoryAvgOrderByAggregateInput
    _max?: IngredientCategoryMaxOrderByAggregateInput
    _min?: IngredientCategoryMinOrderByAggregateInput
    _sum?: IngredientCategorySumOrderByAggregateInput
  }

  export type IngredientCategoryScalarWhereWithAggregatesInput = {
    AND?: IngredientCategoryScalarWhereWithAggregatesInput | IngredientCategoryScalarWhereWithAggregatesInput[]
    OR?: IngredientCategoryScalarWhereWithAggregatesInput[]
    NOT?: IngredientCategoryScalarWhereWithAggregatesInput | IngredientCategoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"IngredientCategory"> | number
    name?: StringWithAggregatesFilter<"IngredientCategory"> | string
    description?: StringNullableWithAggregatesFilter<"IngredientCategory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"IngredientCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"IngredientCategory"> | Date | string
  }

  export type UnitOfMeasureWhereInput = {
    AND?: UnitOfMeasureWhereInput | UnitOfMeasureWhereInput[]
    OR?: UnitOfMeasureWhereInput[]
    NOT?: UnitOfMeasureWhereInput | UnitOfMeasureWhereInput[]
    id?: IntFilter<"UnitOfMeasure"> | number
    name?: StringFilter<"UnitOfMeasure"> | string
    abbreviation?: StringNullableFilter<"UnitOfMeasure"> | string | null
    type?: EnumUnitTypeNullableFilter<"UnitOfMeasure"> | $Enums.UnitType | null
    createdAt?: DateTimeFilter<"UnitOfMeasure"> | Date | string
    updatedAt?: DateTimeFilter<"UnitOfMeasure"> | Date | string
    recipesYield?: RecipeListRelationFilter
    recipeIngredients?: UnitQuantityListRelationFilter
  }

  export type UnitOfMeasureOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    abbreviation?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    recipesYield?: RecipeOrderByRelationAggregateInput
    recipeIngredients?: UnitQuantityOrderByRelationAggregateInput
  }

  export type UnitOfMeasureWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    abbreviation?: string
    AND?: UnitOfMeasureWhereInput | UnitOfMeasureWhereInput[]
    OR?: UnitOfMeasureWhereInput[]
    NOT?: UnitOfMeasureWhereInput | UnitOfMeasureWhereInput[]
    type?: EnumUnitTypeNullableFilter<"UnitOfMeasure"> | $Enums.UnitType | null
    createdAt?: DateTimeFilter<"UnitOfMeasure"> | Date | string
    updatedAt?: DateTimeFilter<"UnitOfMeasure"> | Date | string
    recipesYield?: RecipeListRelationFilter
    recipeIngredients?: UnitQuantityListRelationFilter
  }, "id" | "name" | "abbreviation">

  export type UnitOfMeasureOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    abbreviation?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UnitOfMeasureCountOrderByAggregateInput
    _avg?: UnitOfMeasureAvgOrderByAggregateInput
    _max?: UnitOfMeasureMaxOrderByAggregateInput
    _min?: UnitOfMeasureMinOrderByAggregateInput
    _sum?: UnitOfMeasureSumOrderByAggregateInput
  }

  export type UnitOfMeasureScalarWhereWithAggregatesInput = {
    AND?: UnitOfMeasureScalarWhereWithAggregatesInput | UnitOfMeasureScalarWhereWithAggregatesInput[]
    OR?: UnitOfMeasureScalarWhereWithAggregatesInput[]
    NOT?: UnitOfMeasureScalarWhereWithAggregatesInput | UnitOfMeasureScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UnitOfMeasure"> | number
    name?: StringWithAggregatesFilter<"UnitOfMeasure"> | string
    abbreviation?: StringNullableWithAggregatesFilter<"UnitOfMeasure"> | string | null
    type?: EnumUnitTypeNullableWithAggregatesFilter<"UnitOfMeasure"> | $Enums.UnitType | null
    createdAt?: DateTimeWithAggregatesFilter<"UnitOfMeasure"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UnitOfMeasure"> | Date | string
  }

  export type IngredientWhereInput = {
    AND?: IngredientWhereInput | IngredientWhereInput[]
    OR?: IngredientWhereInput[]
    NOT?: IngredientWhereInput | IngredientWhereInput[]
    id?: IntFilter<"Ingredient"> | number
    name?: StringFilter<"Ingredient"> | string
    description?: StringNullableFilter<"Ingredient"> | string | null
    ingredientCategoryId?: IntNullableFilter<"Ingredient"> | number | null
    createdAt?: DateTimeFilter<"Ingredient"> | Date | string
    updatedAt?: DateTimeFilter<"Ingredient"> | Date | string
    ingredientCategory?: XOR<IngredientCategoryNullableScalarRelationFilter, IngredientCategoryWhereInput> | null
    recipeIngredients?: UnitQuantityListRelationFilter
  }

  export type IngredientOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    ingredientCategoryId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    ingredientCategory?: IngredientCategoryOrderByWithRelationInput
    recipeIngredients?: UnitQuantityOrderByRelationAggregateInput
  }

  export type IngredientWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    name?: string
    AND?: IngredientWhereInput | IngredientWhereInput[]
    OR?: IngredientWhereInput[]
    NOT?: IngredientWhereInput | IngredientWhereInput[]
    description?: StringNullableFilter<"Ingredient"> | string | null
    ingredientCategoryId?: IntNullableFilter<"Ingredient"> | number | null
    createdAt?: DateTimeFilter<"Ingredient"> | Date | string
    updatedAt?: DateTimeFilter<"Ingredient"> | Date | string
    ingredientCategory?: XOR<IngredientCategoryNullableScalarRelationFilter, IngredientCategoryWhereInput> | null
    recipeIngredients?: UnitQuantityListRelationFilter
  }, "id" | "name">

  export type IngredientOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    ingredientCategoryId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: IngredientCountOrderByAggregateInput
    _avg?: IngredientAvgOrderByAggregateInput
    _max?: IngredientMaxOrderByAggregateInput
    _min?: IngredientMinOrderByAggregateInput
    _sum?: IngredientSumOrderByAggregateInput
  }

  export type IngredientScalarWhereWithAggregatesInput = {
    AND?: IngredientScalarWhereWithAggregatesInput | IngredientScalarWhereWithAggregatesInput[]
    OR?: IngredientScalarWhereWithAggregatesInput[]
    NOT?: IngredientScalarWhereWithAggregatesInput | IngredientScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Ingredient"> | number
    name?: StringWithAggregatesFilter<"Ingredient"> | string
    description?: StringNullableWithAggregatesFilter<"Ingredient"> | string | null
    ingredientCategoryId?: IntNullableWithAggregatesFilter<"Ingredient"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Ingredient"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Ingredient"> | Date | string
  }

  export type RecipeWhereInput = {
    AND?: RecipeWhereInput | RecipeWhereInput[]
    OR?: RecipeWhereInput[]
    NOT?: RecipeWhereInput | RecipeWhereInput[]
    id?: IntFilter<"Recipe"> | number
    name?: StringFilter<"Recipe"> | string
    description?: StringNullableFilter<"Recipe"> | string | null
    instructions?: StringFilter<"Recipe"> | string
    yieldQuantity?: DecimalNullableFilter<"Recipe"> | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: IntNullableFilter<"Recipe"> | number | null
    prepTimeMinutes?: IntNullableFilter<"Recipe"> | number | null
    cookTimeMinutes?: IntNullableFilter<"Recipe"> | number | null
    tags?: StringNullableListFilter<"Recipe">
    categoryId?: IntNullableFilter<"Recipe"> | number | null
    userId?: IntNullableFilter<"Recipe"> | number | null
    createdAt?: DateTimeFilter<"Recipe"> | Date | string
    updatedAt?: DateTimeFilter<"Recipe"> | Date | string
    category?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    yieldUnit?: XOR<UnitOfMeasureNullableScalarRelationFilter, UnitOfMeasureWhereInput> | null
    recipeIngredients?: UnitQuantityListRelationFilter
    usedAsSubRecipe?: UnitQuantityListRelationFilter
    author?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type RecipeOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    instructions?: SortOrder
    yieldQuantity?: SortOrderInput | SortOrder
    yieldUnitId?: SortOrderInput | SortOrder
    prepTimeMinutes?: SortOrderInput | SortOrder
    cookTimeMinutes?: SortOrderInput | SortOrder
    tags?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: CategoryOrderByWithRelationInput
    yieldUnit?: UnitOfMeasureOrderByWithRelationInput
    recipeIngredients?: UnitQuantityOrderByRelationAggregateInput
    usedAsSubRecipe?: UnitQuantityOrderByRelationAggregateInput
    author?: UserOrderByWithRelationInput
  }

  export type RecipeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: RecipeWhereInput | RecipeWhereInput[]
    OR?: RecipeWhereInput[]
    NOT?: RecipeWhereInput | RecipeWhereInput[]
    name?: StringFilter<"Recipe"> | string
    description?: StringNullableFilter<"Recipe"> | string | null
    instructions?: StringFilter<"Recipe"> | string
    yieldQuantity?: DecimalNullableFilter<"Recipe"> | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: IntNullableFilter<"Recipe"> | number | null
    prepTimeMinutes?: IntNullableFilter<"Recipe"> | number | null
    cookTimeMinutes?: IntNullableFilter<"Recipe"> | number | null
    tags?: StringNullableListFilter<"Recipe">
    categoryId?: IntNullableFilter<"Recipe"> | number | null
    userId?: IntNullableFilter<"Recipe"> | number | null
    createdAt?: DateTimeFilter<"Recipe"> | Date | string
    updatedAt?: DateTimeFilter<"Recipe"> | Date | string
    category?: XOR<CategoryNullableScalarRelationFilter, CategoryWhereInput> | null
    yieldUnit?: XOR<UnitOfMeasureNullableScalarRelationFilter, UnitOfMeasureWhereInput> | null
    recipeIngredients?: UnitQuantityListRelationFilter
    usedAsSubRecipe?: UnitQuantityListRelationFilter
    author?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id">

  export type RecipeOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    instructions?: SortOrder
    yieldQuantity?: SortOrderInput | SortOrder
    yieldUnitId?: SortOrderInput | SortOrder
    prepTimeMinutes?: SortOrderInput | SortOrder
    cookTimeMinutes?: SortOrderInput | SortOrder
    tags?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RecipeCountOrderByAggregateInput
    _avg?: RecipeAvgOrderByAggregateInput
    _max?: RecipeMaxOrderByAggregateInput
    _min?: RecipeMinOrderByAggregateInput
    _sum?: RecipeSumOrderByAggregateInput
  }

  export type RecipeScalarWhereWithAggregatesInput = {
    AND?: RecipeScalarWhereWithAggregatesInput | RecipeScalarWhereWithAggregatesInput[]
    OR?: RecipeScalarWhereWithAggregatesInput[]
    NOT?: RecipeScalarWhereWithAggregatesInput | RecipeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Recipe"> | number
    name?: StringWithAggregatesFilter<"Recipe"> | string
    description?: StringNullableWithAggregatesFilter<"Recipe"> | string | null
    instructions?: StringWithAggregatesFilter<"Recipe"> | string
    yieldQuantity?: DecimalNullableWithAggregatesFilter<"Recipe"> | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: IntNullableWithAggregatesFilter<"Recipe"> | number | null
    prepTimeMinutes?: IntNullableWithAggregatesFilter<"Recipe"> | number | null
    cookTimeMinutes?: IntNullableWithAggregatesFilter<"Recipe"> | number | null
    tags?: StringNullableListFilter<"Recipe">
    categoryId?: IntNullableWithAggregatesFilter<"Recipe"> | number | null
    userId?: IntNullableWithAggregatesFilter<"Recipe"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Recipe"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Recipe"> | Date | string
  }

  export type UnitQuantityWhereInput = {
    AND?: UnitQuantityWhereInput | UnitQuantityWhereInput[]
    OR?: UnitQuantityWhereInput[]
    NOT?: UnitQuantityWhereInput | UnitQuantityWhereInput[]
    id?: IntFilter<"UnitQuantity"> | number
    recipeId?: IntFilter<"UnitQuantity"> | number
    ingredientId?: IntNullableFilter<"UnitQuantity"> | number | null
    subRecipeId?: IntNullableFilter<"UnitQuantity"> | number | null
    quantity?: DecimalFilter<"UnitQuantity"> | Decimal | DecimalJsLike | number | string
    unitId?: IntFilter<"UnitQuantity"> | number
    order?: IntFilter<"UnitQuantity"> | number
    createdAt?: DateTimeFilter<"UnitQuantity"> | Date | string
    updatedAt?: DateTimeFilter<"UnitQuantity"> | Date | string
    recipe?: XOR<RecipeScalarRelationFilter, RecipeWhereInput>
    ingredient?: XOR<IngredientNullableScalarRelationFilter, IngredientWhereInput> | null
    subRecipe?: XOR<RecipeNullableScalarRelationFilter, RecipeWhereInput> | null
    unit?: XOR<UnitOfMeasureScalarRelationFilter, UnitOfMeasureWhereInput>
  }

  export type UnitQuantityOrderByWithRelationInput = {
    id?: SortOrder
    recipeId?: SortOrder
    ingredientId?: SortOrderInput | SortOrder
    subRecipeId?: SortOrderInput | SortOrder
    quantity?: SortOrder
    unitId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    recipe?: RecipeOrderByWithRelationInput
    ingredient?: IngredientOrderByWithRelationInput
    subRecipe?: RecipeOrderByWithRelationInput
    unit?: UnitOfMeasureOrderByWithRelationInput
  }

  export type UnitQuantityWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: UnitQuantityWhereInput | UnitQuantityWhereInput[]
    OR?: UnitQuantityWhereInput[]
    NOT?: UnitQuantityWhereInput | UnitQuantityWhereInput[]
    recipeId?: IntFilter<"UnitQuantity"> | number
    ingredientId?: IntNullableFilter<"UnitQuantity"> | number | null
    subRecipeId?: IntNullableFilter<"UnitQuantity"> | number | null
    quantity?: DecimalFilter<"UnitQuantity"> | Decimal | DecimalJsLike | number | string
    unitId?: IntFilter<"UnitQuantity"> | number
    order?: IntFilter<"UnitQuantity"> | number
    createdAt?: DateTimeFilter<"UnitQuantity"> | Date | string
    updatedAt?: DateTimeFilter<"UnitQuantity"> | Date | string
    recipe?: XOR<RecipeScalarRelationFilter, RecipeWhereInput>
    ingredient?: XOR<IngredientNullableScalarRelationFilter, IngredientWhereInput> | null
    subRecipe?: XOR<RecipeNullableScalarRelationFilter, RecipeWhereInput> | null
    unit?: XOR<UnitOfMeasureScalarRelationFilter, UnitOfMeasureWhereInput>
  }, "id">

  export type UnitQuantityOrderByWithAggregationInput = {
    id?: SortOrder
    recipeId?: SortOrder
    ingredientId?: SortOrderInput | SortOrder
    subRecipeId?: SortOrderInput | SortOrder
    quantity?: SortOrder
    unitId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UnitQuantityCountOrderByAggregateInput
    _avg?: UnitQuantityAvgOrderByAggregateInput
    _max?: UnitQuantityMaxOrderByAggregateInput
    _min?: UnitQuantityMinOrderByAggregateInput
    _sum?: UnitQuantitySumOrderByAggregateInput
  }

  export type UnitQuantityScalarWhereWithAggregatesInput = {
    AND?: UnitQuantityScalarWhereWithAggregatesInput | UnitQuantityScalarWhereWithAggregatesInput[]
    OR?: UnitQuantityScalarWhereWithAggregatesInput[]
    NOT?: UnitQuantityScalarWhereWithAggregatesInput | UnitQuantityScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UnitQuantity"> | number
    recipeId?: IntWithAggregatesFilter<"UnitQuantity"> | number
    ingredientId?: IntNullableWithAggregatesFilter<"UnitQuantity"> | number | null
    subRecipeId?: IntNullableWithAggregatesFilter<"UnitQuantity"> | number | null
    quantity?: DecimalWithAggregatesFilter<"UnitQuantity"> | Decimal | DecimalJsLike | number | string
    unitId?: IntWithAggregatesFilter<"UnitQuantity"> | number
    order?: IntWithAggregatesFilter<"UnitQuantity"> | number
    createdAt?: DateTimeWithAggregatesFilter<"UnitQuantity"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UnitQuantity"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    email?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    recipes?: RecipeListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    recipes?: RecipeOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    recipes?: RecipeListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    email?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type CategoryCreateInput = {
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipes?: RecipeCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipes?: RecipeUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type CategoryUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipes?: RecipeUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipes?: RecipeUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type CategoryCreateManyInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngredientCategoryCreateInput = {
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ingredients?: IngredientCreateNestedManyWithoutIngredientCategoryInput
  }

  export type IngredientCategoryUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ingredients?: IngredientUncheckedCreateNestedManyWithoutIngredientCategoryInput
  }

  export type IngredientCategoryUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingredients?: IngredientUpdateManyWithoutIngredientCategoryNestedInput
  }

  export type IngredientCategoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingredients?: IngredientUncheckedUpdateManyWithoutIngredientCategoryNestedInput
  }

  export type IngredientCategoryCreateManyInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IngredientCategoryUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngredientCategoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitOfMeasureCreateInput = {
    name: string
    abbreviation?: string | null
    type?: $Enums.UnitType | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipesYield?: RecipeCreateNestedManyWithoutYieldUnitInput
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutUnitInput
  }

  export type UnitOfMeasureUncheckedCreateInput = {
    id?: number
    name: string
    abbreviation?: string | null
    type?: $Enums.UnitType | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipesYield?: RecipeUncheckedCreateNestedManyWithoutYieldUnitInput
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitOfMeasureUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipesYield?: RecipeUpdateManyWithoutYieldUnitNestedInput
    recipeIngredients?: UnitQuantityUpdateManyWithoutUnitNestedInput
  }

  export type UnitOfMeasureUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipesYield?: RecipeUncheckedUpdateManyWithoutYieldUnitNestedInput
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type UnitOfMeasureCreateManyInput = {
    id?: number
    name: string
    abbreviation?: string | null
    type?: $Enums.UnitType | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitOfMeasureUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitOfMeasureUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngredientCreateInput = {
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ingredientCategory?: IngredientCategoryCreateNestedOneWithoutIngredientsInput
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutIngredientInput
  }

  export type IngredientUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    ingredientCategoryId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutIngredientInput
  }

  export type IngredientUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingredientCategory?: IngredientCategoryUpdateOneWithoutIngredientsNestedInput
    recipeIngredients?: UnitQuantityUpdateManyWithoutIngredientNestedInput
  }

  export type IngredientUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientCategoryId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutIngredientNestedInput
  }

  export type IngredientCreateManyInput = {
    id?: number
    name: string
    description?: string | null
    ingredientCategoryId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IngredientUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngredientUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientCategoryId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecipeCreateInput = {
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: CategoryCreateNestedOneWithoutRecipesInput
    yieldUnit?: UnitOfMeasureCreateNestedOneWithoutRecipesYieldInput
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityCreateNestedManyWithoutSubRecipeInput
    author?: UserCreateNestedOneWithoutRecipesInput
  }

  export type RecipeUncheckedCreateInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityUncheckedCreateNestedManyWithoutSubRecipeInput
  }

  export type RecipeUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: CategoryUpdateOneWithoutRecipesNestedInput
    yieldUnit?: UnitOfMeasureUpdateOneWithoutRecipesYieldNestedInput
    recipeIngredients?: UnitQuantityUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUpdateManyWithoutSubRecipeNestedInput
    author?: UserUpdateOneWithoutRecipesNestedInput
  }

  export type RecipeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUncheckedUpdateManyWithoutSubRecipeNestedInput
  }

  export type RecipeCreateManyInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecipeUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecipeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityCreateInput = {
    quantity: Decimal | DecimalJsLike | number | string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    recipe: RecipeCreateNestedOneWithoutRecipeIngredientsInput
    ingredient?: IngredientCreateNestedOneWithoutRecipeIngredientsInput
    subRecipe?: RecipeCreateNestedOneWithoutUsedAsSubRecipeInput
    unit: UnitOfMeasureCreateNestedOneWithoutRecipeIngredientsInput
  }

  export type UnitQuantityUncheckedCreateInput = {
    id?: number
    recipeId: number
    ingredientId?: number | null
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityUpdateInput = {
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipe?: RecipeUpdateOneRequiredWithoutRecipeIngredientsNestedInput
    ingredient?: IngredientUpdateOneWithoutRecipeIngredientsNestedInput
    subRecipe?: RecipeUpdateOneWithoutUsedAsSubRecipeNestedInput
    unit?: UnitOfMeasureUpdateOneRequiredWithoutRecipeIngredientsNestedInput
  }

  export type UnitQuantityUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityCreateManyInput = {
    id?: number
    recipeId: number
    ingredientId?: number | null
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityUpdateManyMutationInput = {
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    recipes?: RecipeCreateNestedManyWithoutAuthorInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    recipes?: RecipeUncheckedCreateNestedManyWithoutAuthorInput
  }

  export type UserUpdateInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipes?: RecipeUpdateManyWithoutAuthorNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipes?: RecipeUncheckedUpdateManyWithoutAuthorNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type RecipeListRelationFilter = {
    every?: RecipeWhereInput
    some?: RecipeWhereInput
    none?: RecipeWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type RecipeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type CategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CategorySumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IngredientListRelationFilter = {
    every?: IngredientWhereInput
    some?: IngredientWhereInput
    none?: IngredientWhereInput
  }

  export type IngredientOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type IngredientCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IngredientCategoryAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IngredientCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IngredientCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IngredientCategorySumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumUnitTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.UnitType | EnumUnitTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumUnitTypeNullableFilter<$PrismaModel> | $Enums.UnitType | null
  }

  export type UnitQuantityListRelationFilter = {
    every?: UnitQuantityWhereInput
    some?: UnitQuantityWhereInput
    none?: UnitQuantityWhereInput
  }

  export type UnitQuantityOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UnitOfMeasureCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    abbreviation?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitOfMeasureAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UnitOfMeasureMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    abbreviation?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitOfMeasureMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    abbreviation?: SortOrder
    type?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitOfMeasureSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type EnumUnitTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UnitType | EnumUnitTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumUnitTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.UnitType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumUnitTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumUnitTypeNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type IngredientCategoryNullableScalarRelationFilter = {
    is?: IngredientCategoryWhereInput | null
    isNot?: IngredientCategoryWhereInput | null
  }

  export type IngredientCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    ingredientCategoryId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IngredientAvgOrderByAggregateInput = {
    id?: SortOrder
    ingredientCategoryId?: SortOrder
  }

  export type IngredientMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    ingredientCategoryId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IngredientMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    ingredientCategoryId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type IngredientSumOrderByAggregateInput = {
    id?: SortOrder
    ingredientCategoryId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type CategoryNullableScalarRelationFilter = {
    is?: CategoryWhereInput | null
    isNot?: CategoryWhereInput | null
  }

  export type UnitOfMeasureNullableScalarRelationFilter = {
    is?: UnitOfMeasureWhereInput | null
    isNot?: UnitOfMeasureWhereInput | null
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type RecipeCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    yieldQuantity?: SortOrder
    yieldUnitId?: SortOrder
    prepTimeMinutes?: SortOrder
    cookTimeMinutes?: SortOrder
    tags?: SortOrder
    categoryId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecipeAvgOrderByAggregateInput = {
    id?: SortOrder
    yieldQuantity?: SortOrder
    yieldUnitId?: SortOrder
    prepTimeMinutes?: SortOrder
    cookTimeMinutes?: SortOrder
    categoryId?: SortOrder
    userId?: SortOrder
  }

  export type RecipeMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    yieldQuantity?: SortOrder
    yieldUnitId?: SortOrder
    prepTimeMinutes?: SortOrder
    cookTimeMinutes?: SortOrder
    categoryId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecipeMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    instructions?: SortOrder
    yieldQuantity?: SortOrder
    yieldUnitId?: SortOrder
    prepTimeMinutes?: SortOrder
    cookTimeMinutes?: SortOrder
    categoryId?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RecipeSumOrderByAggregateInput = {
    id?: SortOrder
    yieldQuantity?: SortOrder
    yieldUnitId?: SortOrder
    prepTimeMinutes?: SortOrder
    cookTimeMinutes?: SortOrder
    categoryId?: SortOrder
    userId?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type RecipeScalarRelationFilter = {
    is?: RecipeWhereInput
    isNot?: RecipeWhereInput
  }

  export type IngredientNullableScalarRelationFilter = {
    is?: IngredientWhereInput | null
    isNot?: IngredientWhereInput | null
  }

  export type RecipeNullableScalarRelationFilter = {
    is?: RecipeWhereInput | null
    isNot?: RecipeWhereInput | null
  }

  export type UnitOfMeasureScalarRelationFilter = {
    is?: UnitOfMeasureWhereInput
    isNot?: UnitOfMeasureWhereInput
  }

  export type UnitQuantityCountOrderByAggregateInput = {
    id?: SortOrder
    recipeId?: SortOrder
    ingredientId?: SortOrder
    subRecipeId?: SortOrder
    quantity?: SortOrder
    unitId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitQuantityAvgOrderByAggregateInput = {
    id?: SortOrder
    recipeId?: SortOrder
    ingredientId?: SortOrder
    subRecipeId?: SortOrder
    quantity?: SortOrder
    unitId?: SortOrder
    order?: SortOrder
  }

  export type UnitQuantityMaxOrderByAggregateInput = {
    id?: SortOrder
    recipeId?: SortOrder
    ingredientId?: SortOrder
    subRecipeId?: SortOrder
    quantity?: SortOrder
    unitId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitQuantityMinOrderByAggregateInput = {
    id?: SortOrder
    recipeId?: SortOrder
    ingredientId?: SortOrder
    subRecipeId?: SortOrder
    quantity?: SortOrder
    unitId?: SortOrder
    order?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UnitQuantitySumOrderByAggregateInput = {
    id?: SortOrder
    recipeId?: SortOrder
    ingredientId?: SortOrder
    subRecipeId?: SortOrder
    quantity?: SortOrder
    unitId?: SortOrder
    order?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    name?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RecipeCreateNestedManyWithoutCategoryInput = {
    create?: XOR<RecipeCreateWithoutCategoryInput, RecipeUncheckedCreateWithoutCategoryInput> | RecipeCreateWithoutCategoryInput[] | RecipeUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutCategoryInput | RecipeCreateOrConnectWithoutCategoryInput[]
    createMany?: RecipeCreateManyCategoryInputEnvelope
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
  }

  export type RecipeUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<RecipeCreateWithoutCategoryInput, RecipeUncheckedCreateWithoutCategoryInput> | RecipeCreateWithoutCategoryInput[] | RecipeUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutCategoryInput | RecipeCreateOrConnectWithoutCategoryInput[]
    createMany?: RecipeCreateManyCategoryInputEnvelope
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type RecipeUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<RecipeCreateWithoutCategoryInput, RecipeUncheckedCreateWithoutCategoryInput> | RecipeCreateWithoutCategoryInput[] | RecipeUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutCategoryInput | RecipeCreateOrConnectWithoutCategoryInput[]
    upsert?: RecipeUpsertWithWhereUniqueWithoutCategoryInput | RecipeUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: RecipeCreateManyCategoryInputEnvelope
    set?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    disconnect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    delete?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    update?: RecipeUpdateWithWhereUniqueWithoutCategoryInput | RecipeUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: RecipeUpdateManyWithWhereWithoutCategoryInput | RecipeUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RecipeUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<RecipeCreateWithoutCategoryInput, RecipeUncheckedCreateWithoutCategoryInput> | RecipeCreateWithoutCategoryInput[] | RecipeUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutCategoryInput | RecipeCreateOrConnectWithoutCategoryInput[]
    upsert?: RecipeUpsertWithWhereUniqueWithoutCategoryInput | RecipeUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: RecipeCreateManyCategoryInputEnvelope
    set?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    disconnect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    delete?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    update?: RecipeUpdateWithWhereUniqueWithoutCategoryInput | RecipeUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: RecipeUpdateManyWithWhereWithoutCategoryInput | RecipeUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
  }

  export type IngredientCreateNestedManyWithoutIngredientCategoryInput = {
    create?: XOR<IngredientCreateWithoutIngredientCategoryInput, IngredientUncheckedCreateWithoutIngredientCategoryInput> | IngredientCreateWithoutIngredientCategoryInput[] | IngredientUncheckedCreateWithoutIngredientCategoryInput[]
    connectOrCreate?: IngredientCreateOrConnectWithoutIngredientCategoryInput | IngredientCreateOrConnectWithoutIngredientCategoryInput[]
    createMany?: IngredientCreateManyIngredientCategoryInputEnvelope
    connect?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
  }

  export type IngredientUncheckedCreateNestedManyWithoutIngredientCategoryInput = {
    create?: XOR<IngredientCreateWithoutIngredientCategoryInput, IngredientUncheckedCreateWithoutIngredientCategoryInput> | IngredientCreateWithoutIngredientCategoryInput[] | IngredientUncheckedCreateWithoutIngredientCategoryInput[]
    connectOrCreate?: IngredientCreateOrConnectWithoutIngredientCategoryInput | IngredientCreateOrConnectWithoutIngredientCategoryInput[]
    createMany?: IngredientCreateManyIngredientCategoryInputEnvelope
    connect?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
  }

  export type IngredientUpdateManyWithoutIngredientCategoryNestedInput = {
    create?: XOR<IngredientCreateWithoutIngredientCategoryInput, IngredientUncheckedCreateWithoutIngredientCategoryInput> | IngredientCreateWithoutIngredientCategoryInput[] | IngredientUncheckedCreateWithoutIngredientCategoryInput[]
    connectOrCreate?: IngredientCreateOrConnectWithoutIngredientCategoryInput | IngredientCreateOrConnectWithoutIngredientCategoryInput[]
    upsert?: IngredientUpsertWithWhereUniqueWithoutIngredientCategoryInput | IngredientUpsertWithWhereUniqueWithoutIngredientCategoryInput[]
    createMany?: IngredientCreateManyIngredientCategoryInputEnvelope
    set?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    disconnect?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    delete?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    connect?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    update?: IngredientUpdateWithWhereUniqueWithoutIngredientCategoryInput | IngredientUpdateWithWhereUniqueWithoutIngredientCategoryInput[]
    updateMany?: IngredientUpdateManyWithWhereWithoutIngredientCategoryInput | IngredientUpdateManyWithWhereWithoutIngredientCategoryInput[]
    deleteMany?: IngredientScalarWhereInput | IngredientScalarWhereInput[]
  }

  export type IngredientUncheckedUpdateManyWithoutIngredientCategoryNestedInput = {
    create?: XOR<IngredientCreateWithoutIngredientCategoryInput, IngredientUncheckedCreateWithoutIngredientCategoryInput> | IngredientCreateWithoutIngredientCategoryInput[] | IngredientUncheckedCreateWithoutIngredientCategoryInput[]
    connectOrCreate?: IngredientCreateOrConnectWithoutIngredientCategoryInput | IngredientCreateOrConnectWithoutIngredientCategoryInput[]
    upsert?: IngredientUpsertWithWhereUniqueWithoutIngredientCategoryInput | IngredientUpsertWithWhereUniqueWithoutIngredientCategoryInput[]
    createMany?: IngredientCreateManyIngredientCategoryInputEnvelope
    set?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    disconnect?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    delete?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    connect?: IngredientWhereUniqueInput | IngredientWhereUniqueInput[]
    update?: IngredientUpdateWithWhereUniqueWithoutIngredientCategoryInput | IngredientUpdateWithWhereUniqueWithoutIngredientCategoryInput[]
    updateMany?: IngredientUpdateManyWithWhereWithoutIngredientCategoryInput | IngredientUpdateManyWithWhereWithoutIngredientCategoryInput[]
    deleteMany?: IngredientScalarWhereInput | IngredientScalarWhereInput[]
  }

  export type RecipeCreateNestedManyWithoutYieldUnitInput = {
    create?: XOR<RecipeCreateWithoutYieldUnitInput, RecipeUncheckedCreateWithoutYieldUnitInput> | RecipeCreateWithoutYieldUnitInput[] | RecipeUncheckedCreateWithoutYieldUnitInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutYieldUnitInput | RecipeCreateOrConnectWithoutYieldUnitInput[]
    createMany?: RecipeCreateManyYieldUnitInputEnvelope
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
  }

  export type UnitQuantityCreateNestedManyWithoutUnitInput = {
    create?: XOR<UnitQuantityCreateWithoutUnitInput, UnitQuantityUncheckedCreateWithoutUnitInput> | UnitQuantityCreateWithoutUnitInput[] | UnitQuantityUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutUnitInput | UnitQuantityCreateOrConnectWithoutUnitInput[]
    createMany?: UnitQuantityCreateManyUnitInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type RecipeUncheckedCreateNestedManyWithoutYieldUnitInput = {
    create?: XOR<RecipeCreateWithoutYieldUnitInput, RecipeUncheckedCreateWithoutYieldUnitInput> | RecipeCreateWithoutYieldUnitInput[] | RecipeUncheckedCreateWithoutYieldUnitInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutYieldUnitInput | RecipeCreateOrConnectWithoutYieldUnitInput[]
    createMany?: RecipeCreateManyYieldUnitInputEnvelope
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
  }

  export type UnitQuantityUncheckedCreateNestedManyWithoutUnitInput = {
    create?: XOR<UnitQuantityCreateWithoutUnitInput, UnitQuantityUncheckedCreateWithoutUnitInput> | UnitQuantityCreateWithoutUnitInput[] | UnitQuantityUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutUnitInput | UnitQuantityCreateOrConnectWithoutUnitInput[]
    createMany?: UnitQuantityCreateManyUnitInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type NullableEnumUnitTypeFieldUpdateOperationsInput = {
    set?: $Enums.UnitType | null
  }

  export type RecipeUpdateManyWithoutYieldUnitNestedInput = {
    create?: XOR<RecipeCreateWithoutYieldUnitInput, RecipeUncheckedCreateWithoutYieldUnitInput> | RecipeCreateWithoutYieldUnitInput[] | RecipeUncheckedCreateWithoutYieldUnitInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutYieldUnitInput | RecipeCreateOrConnectWithoutYieldUnitInput[]
    upsert?: RecipeUpsertWithWhereUniqueWithoutYieldUnitInput | RecipeUpsertWithWhereUniqueWithoutYieldUnitInput[]
    createMany?: RecipeCreateManyYieldUnitInputEnvelope
    set?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    disconnect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    delete?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    update?: RecipeUpdateWithWhereUniqueWithoutYieldUnitInput | RecipeUpdateWithWhereUniqueWithoutYieldUnitInput[]
    updateMany?: RecipeUpdateManyWithWhereWithoutYieldUnitInput | RecipeUpdateManyWithWhereWithoutYieldUnitInput[]
    deleteMany?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
  }

  export type UnitQuantityUpdateManyWithoutUnitNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutUnitInput, UnitQuantityUncheckedCreateWithoutUnitInput> | UnitQuantityCreateWithoutUnitInput[] | UnitQuantityUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutUnitInput | UnitQuantityCreateOrConnectWithoutUnitInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutUnitInput | UnitQuantityUpsertWithWhereUniqueWithoutUnitInput[]
    createMany?: UnitQuantityCreateManyUnitInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutUnitInput | UnitQuantityUpdateWithWhereUniqueWithoutUnitInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutUnitInput | UnitQuantityUpdateManyWithWhereWithoutUnitInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type RecipeUncheckedUpdateManyWithoutYieldUnitNestedInput = {
    create?: XOR<RecipeCreateWithoutYieldUnitInput, RecipeUncheckedCreateWithoutYieldUnitInput> | RecipeCreateWithoutYieldUnitInput[] | RecipeUncheckedCreateWithoutYieldUnitInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutYieldUnitInput | RecipeCreateOrConnectWithoutYieldUnitInput[]
    upsert?: RecipeUpsertWithWhereUniqueWithoutYieldUnitInput | RecipeUpsertWithWhereUniqueWithoutYieldUnitInput[]
    createMany?: RecipeCreateManyYieldUnitInputEnvelope
    set?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    disconnect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    delete?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    update?: RecipeUpdateWithWhereUniqueWithoutYieldUnitInput | RecipeUpdateWithWhereUniqueWithoutYieldUnitInput[]
    updateMany?: RecipeUpdateManyWithWhereWithoutYieldUnitInput | RecipeUpdateManyWithWhereWithoutYieldUnitInput[]
    deleteMany?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
  }

  export type UnitQuantityUncheckedUpdateManyWithoutUnitNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutUnitInput, UnitQuantityUncheckedCreateWithoutUnitInput> | UnitQuantityCreateWithoutUnitInput[] | UnitQuantityUncheckedCreateWithoutUnitInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutUnitInput | UnitQuantityCreateOrConnectWithoutUnitInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutUnitInput | UnitQuantityUpsertWithWhereUniqueWithoutUnitInput[]
    createMany?: UnitQuantityCreateManyUnitInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutUnitInput | UnitQuantityUpdateWithWhereUniqueWithoutUnitInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutUnitInput | UnitQuantityUpdateManyWithWhereWithoutUnitInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type IngredientCategoryCreateNestedOneWithoutIngredientsInput = {
    create?: XOR<IngredientCategoryCreateWithoutIngredientsInput, IngredientCategoryUncheckedCreateWithoutIngredientsInput>
    connectOrCreate?: IngredientCategoryCreateOrConnectWithoutIngredientsInput
    connect?: IngredientCategoryWhereUniqueInput
  }

  export type UnitQuantityCreateNestedManyWithoutIngredientInput = {
    create?: XOR<UnitQuantityCreateWithoutIngredientInput, UnitQuantityUncheckedCreateWithoutIngredientInput> | UnitQuantityCreateWithoutIngredientInput[] | UnitQuantityUncheckedCreateWithoutIngredientInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutIngredientInput | UnitQuantityCreateOrConnectWithoutIngredientInput[]
    createMany?: UnitQuantityCreateManyIngredientInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type UnitQuantityUncheckedCreateNestedManyWithoutIngredientInput = {
    create?: XOR<UnitQuantityCreateWithoutIngredientInput, UnitQuantityUncheckedCreateWithoutIngredientInput> | UnitQuantityCreateWithoutIngredientInput[] | UnitQuantityUncheckedCreateWithoutIngredientInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutIngredientInput | UnitQuantityCreateOrConnectWithoutIngredientInput[]
    createMany?: UnitQuantityCreateManyIngredientInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type IngredientCategoryUpdateOneWithoutIngredientsNestedInput = {
    create?: XOR<IngredientCategoryCreateWithoutIngredientsInput, IngredientCategoryUncheckedCreateWithoutIngredientsInput>
    connectOrCreate?: IngredientCategoryCreateOrConnectWithoutIngredientsInput
    upsert?: IngredientCategoryUpsertWithoutIngredientsInput
    disconnect?: IngredientCategoryWhereInput | boolean
    delete?: IngredientCategoryWhereInput | boolean
    connect?: IngredientCategoryWhereUniqueInput
    update?: XOR<XOR<IngredientCategoryUpdateToOneWithWhereWithoutIngredientsInput, IngredientCategoryUpdateWithoutIngredientsInput>, IngredientCategoryUncheckedUpdateWithoutIngredientsInput>
  }

  export type UnitQuantityUpdateManyWithoutIngredientNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutIngredientInput, UnitQuantityUncheckedCreateWithoutIngredientInput> | UnitQuantityCreateWithoutIngredientInput[] | UnitQuantityUncheckedCreateWithoutIngredientInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutIngredientInput | UnitQuantityCreateOrConnectWithoutIngredientInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutIngredientInput | UnitQuantityUpsertWithWhereUniqueWithoutIngredientInput[]
    createMany?: UnitQuantityCreateManyIngredientInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutIngredientInput | UnitQuantityUpdateWithWhereUniqueWithoutIngredientInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutIngredientInput | UnitQuantityUpdateManyWithWhereWithoutIngredientInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UnitQuantityUncheckedUpdateManyWithoutIngredientNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutIngredientInput, UnitQuantityUncheckedCreateWithoutIngredientInput> | UnitQuantityCreateWithoutIngredientInput[] | UnitQuantityUncheckedCreateWithoutIngredientInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutIngredientInput | UnitQuantityCreateOrConnectWithoutIngredientInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutIngredientInput | UnitQuantityUpsertWithWhereUniqueWithoutIngredientInput[]
    createMany?: UnitQuantityCreateManyIngredientInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutIngredientInput | UnitQuantityUpdateWithWhereUniqueWithoutIngredientInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutIngredientInput | UnitQuantityUpdateManyWithWhereWithoutIngredientInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type RecipeCreatetagsInput = {
    set: string[]
  }

  export type CategoryCreateNestedOneWithoutRecipesInput = {
    create?: XOR<CategoryCreateWithoutRecipesInput, CategoryUncheckedCreateWithoutRecipesInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutRecipesInput
    connect?: CategoryWhereUniqueInput
  }

  export type UnitOfMeasureCreateNestedOneWithoutRecipesYieldInput = {
    create?: XOR<UnitOfMeasureCreateWithoutRecipesYieldInput, UnitOfMeasureUncheckedCreateWithoutRecipesYieldInput>
    connectOrCreate?: UnitOfMeasureCreateOrConnectWithoutRecipesYieldInput
    connect?: UnitOfMeasureWhereUniqueInput
  }

  export type UnitQuantityCreateNestedManyWithoutRecipeInput = {
    create?: XOR<UnitQuantityCreateWithoutRecipeInput, UnitQuantityUncheckedCreateWithoutRecipeInput> | UnitQuantityCreateWithoutRecipeInput[] | UnitQuantityUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutRecipeInput | UnitQuantityCreateOrConnectWithoutRecipeInput[]
    createMany?: UnitQuantityCreateManyRecipeInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type UnitQuantityCreateNestedManyWithoutSubRecipeInput = {
    create?: XOR<UnitQuantityCreateWithoutSubRecipeInput, UnitQuantityUncheckedCreateWithoutSubRecipeInput> | UnitQuantityCreateWithoutSubRecipeInput[] | UnitQuantityUncheckedCreateWithoutSubRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutSubRecipeInput | UnitQuantityCreateOrConnectWithoutSubRecipeInput[]
    createMany?: UnitQuantityCreateManySubRecipeInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type UserCreateNestedOneWithoutRecipesInput = {
    create?: XOR<UserCreateWithoutRecipesInput, UserUncheckedCreateWithoutRecipesInput>
    connectOrCreate?: UserCreateOrConnectWithoutRecipesInput
    connect?: UserWhereUniqueInput
  }

  export type UnitQuantityUncheckedCreateNestedManyWithoutRecipeInput = {
    create?: XOR<UnitQuantityCreateWithoutRecipeInput, UnitQuantityUncheckedCreateWithoutRecipeInput> | UnitQuantityCreateWithoutRecipeInput[] | UnitQuantityUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutRecipeInput | UnitQuantityCreateOrConnectWithoutRecipeInput[]
    createMany?: UnitQuantityCreateManyRecipeInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type UnitQuantityUncheckedCreateNestedManyWithoutSubRecipeInput = {
    create?: XOR<UnitQuantityCreateWithoutSubRecipeInput, UnitQuantityUncheckedCreateWithoutSubRecipeInput> | UnitQuantityCreateWithoutSubRecipeInput[] | UnitQuantityUncheckedCreateWithoutSubRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutSubRecipeInput | UnitQuantityCreateOrConnectWithoutSubRecipeInput[]
    createMany?: UnitQuantityCreateManySubRecipeInputEnvelope
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type RecipeUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type CategoryUpdateOneWithoutRecipesNestedInput = {
    create?: XOR<CategoryCreateWithoutRecipesInput, CategoryUncheckedCreateWithoutRecipesInput>
    connectOrCreate?: CategoryCreateOrConnectWithoutRecipesInput
    upsert?: CategoryUpsertWithoutRecipesInput
    disconnect?: CategoryWhereInput | boolean
    delete?: CategoryWhereInput | boolean
    connect?: CategoryWhereUniqueInput
    update?: XOR<XOR<CategoryUpdateToOneWithWhereWithoutRecipesInput, CategoryUpdateWithoutRecipesInput>, CategoryUncheckedUpdateWithoutRecipesInput>
  }

  export type UnitOfMeasureUpdateOneWithoutRecipesYieldNestedInput = {
    create?: XOR<UnitOfMeasureCreateWithoutRecipesYieldInput, UnitOfMeasureUncheckedCreateWithoutRecipesYieldInput>
    connectOrCreate?: UnitOfMeasureCreateOrConnectWithoutRecipesYieldInput
    upsert?: UnitOfMeasureUpsertWithoutRecipesYieldInput
    disconnect?: UnitOfMeasureWhereInput | boolean
    delete?: UnitOfMeasureWhereInput | boolean
    connect?: UnitOfMeasureWhereUniqueInput
    update?: XOR<XOR<UnitOfMeasureUpdateToOneWithWhereWithoutRecipesYieldInput, UnitOfMeasureUpdateWithoutRecipesYieldInput>, UnitOfMeasureUncheckedUpdateWithoutRecipesYieldInput>
  }

  export type UnitQuantityUpdateManyWithoutRecipeNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutRecipeInput, UnitQuantityUncheckedCreateWithoutRecipeInput> | UnitQuantityCreateWithoutRecipeInput[] | UnitQuantityUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutRecipeInput | UnitQuantityCreateOrConnectWithoutRecipeInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutRecipeInput | UnitQuantityUpsertWithWhereUniqueWithoutRecipeInput[]
    createMany?: UnitQuantityCreateManyRecipeInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutRecipeInput | UnitQuantityUpdateWithWhereUniqueWithoutRecipeInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutRecipeInput | UnitQuantityUpdateManyWithWhereWithoutRecipeInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type UnitQuantityUpdateManyWithoutSubRecipeNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutSubRecipeInput, UnitQuantityUncheckedCreateWithoutSubRecipeInput> | UnitQuantityCreateWithoutSubRecipeInput[] | UnitQuantityUncheckedCreateWithoutSubRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutSubRecipeInput | UnitQuantityCreateOrConnectWithoutSubRecipeInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutSubRecipeInput | UnitQuantityUpsertWithWhereUniqueWithoutSubRecipeInput[]
    createMany?: UnitQuantityCreateManySubRecipeInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutSubRecipeInput | UnitQuantityUpdateWithWhereUniqueWithoutSubRecipeInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutSubRecipeInput | UnitQuantityUpdateManyWithWhereWithoutSubRecipeInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type UserUpdateOneWithoutRecipesNestedInput = {
    create?: XOR<UserCreateWithoutRecipesInput, UserUncheckedCreateWithoutRecipesInput>
    connectOrCreate?: UserCreateOrConnectWithoutRecipesInput
    upsert?: UserUpsertWithoutRecipesInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRecipesInput, UserUpdateWithoutRecipesInput>, UserUncheckedUpdateWithoutRecipesInput>
  }

  export type UnitQuantityUncheckedUpdateManyWithoutRecipeNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutRecipeInput, UnitQuantityUncheckedCreateWithoutRecipeInput> | UnitQuantityCreateWithoutRecipeInput[] | UnitQuantityUncheckedCreateWithoutRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutRecipeInput | UnitQuantityCreateOrConnectWithoutRecipeInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutRecipeInput | UnitQuantityUpsertWithWhereUniqueWithoutRecipeInput[]
    createMany?: UnitQuantityCreateManyRecipeInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutRecipeInput | UnitQuantityUpdateWithWhereUniqueWithoutRecipeInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutRecipeInput | UnitQuantityUpdateManyWithWhereWithoutRecipeInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type UnitQuantityUncheckedUpdateManyWithoutSubRecipeNestedInput = {
    create?: XOR<UnitQuantityCreateWithoutSubRecipeInput, UnitQuantityUncheckedCreateWithoutSubRecipeInput> | UnitQuantityCreateWithoutSubRecipeInput[] | UnitQuantityUncheckedCreateWithoutSubRecipeInput[]
    connectOrCreate?: UnitQuantityCreateOrConnectWithoutSubRecipeInput | UnitQuantityCreateOrConnectWithoutSubRecipeInput[]
    upsert?: UnitQuantityUpsertWithWhereUniqueWithoutSubRecipeInput | UnitQuantityUpsertWithWhereUniqueWithoutSubRecipeInput[]
    createMany?: UnitQuantityCreateManySubRecipeInputEnvelope
    set?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    disconnect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    delete?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    connect?: UnitQuantityWhereUniqueInput | UnitQuantityWhereUniqueInput[]
    update?: UnitQuantityUpdateWithWhereUniqueWithoutSubRecipeInput | UnitQuantityUpdateWithWhereUniqueWithoutSubRecipeInput[]
    updateMany?: UnitQuantityUpdateManyWithWhereWithoutSubRecipeInput | UnitQuantityUpdateManyWithWhereWithoutSubRecipeInput[]
    deleteMany?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
  }

  export type RecipeCreateNestedOneWithoutRecipeIngredientsInput = {
    create?: XOR<RecipeCreateWithoutRecipeIngredientsInput, RecipeUncheckedCreateWithoutRecipeIngredientsInput>
    connectOrCreate?: RecipeCreateOrConnectWithoutRecipeIngredientsInput
    connect?: RecipeWhereUniqueInput
  }

  export type IngredientCreateNestedOneWithoutRecipeIngredientsInput = {
    create?: XOR<IngredientCreateWithoutRecipeIngredientsInput, IngredientUncheckedCreateWithoutRecipeIngredientsInput>
    connectOrCreate?: IngredientCreateOrConnectWithoutRecipeIngredientsInput
    connect?: IngredientWhereUniqueInput
  }

  export type RecipeCreateNestedOneWithoutUsedAsSubRecipeInput = {
    create?: XOR<RecipeCreateWithoutUsedAsSubRecipeInput, RecipeUncheckedCreateWithoutUsedAsSubRecipeInput>
    connectOrCreate?: RecipeCreateOrConnectWithoutUsedAsSubRecipeInput
    connect?: RecipeWhereUniqueInput
  }

  export type UnitOfMeasureCreateNestedOneWithoutRecipeIngredientsInput = {
    create?: XOR<UnitOfMeasureCreateWithoutRecipeIngredientsInput, UnitOfMeasureUncheckedCreateWithoutRecipeIngredientsInput>
    connectOrCreate?: UnitOfMeasureCreateOrConnectWithoutRecipeIngredientsInput
    connect?: UnitOfMeasureWhereUniqueInput
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type RecipeUpdateOneRequiredWithoutRecipeIngredientsNestedInput = {
    create?: XOR<RecipeCreateWithoutRecipeIngredientsInput, RecipeUncheckedCreateWithoutRecipeIngredientsInput>
    connectOrCreate?: RecipeCreateOrConnectWithoutRecipeIngredientsInput
    upsert?: RecipeUpsertWithoutRecipeIngredientsInput
    connect?: RecipeWhereUniqueInput
    update?: XOR<XOR<RecipeUpdateToOneWithWhereWithoutRecipeIngredientsInput, RecipeUpdateWithoutRecipeIngredientsInput>, RecipeUncheckedUpdateWithoutRecipeIngredientsInput>
  }

  export type IngredientUpdateOneWithoutRecipeIngredientsNestedInput = {
    create?: XOR<IngredientCreateWithoutRecipeIngredientsInput, IngredientUncheckedCreateWithoutRecipeIngredientsInput>
    connectOrCreate?: IngredientCreateOrConnectWithoutRecipeIngredientsInput
    upsert?: IngredientUpsertWithoutRecipeIngredientsInput
    disconnect?: IngredientWhereInput | boolean
    delete?: IngredientWhereInput | boolean
    connect?: IngredientWhereUniqueInput
    update?: XOR<XOR<IngredientUpdateToOneWithWhereWithoutRecipeIngredientsInput, IngredientUpdateWithoutRecipeIngredientsInput>, IngredientUncheckedUpdateWithoutRecipeIngredientsInput>
  }

  export type RecipeUpdateOneWithoutUsedAsSubRecipeNestedInput = {
    create?: XOR<RecipeCreateWithoutUsedAsSubRecipeInput, RecipeUncheckedCreateWithoutUsedAsSubRecipeInput>
    connectOrCreate?: RecipeCreateOrConnectWithoutUsedAsSubRecipeInput
    upsert?: RecipeUpsertWithoutUsedAsSubRecipeInput
    disconnect?: RecipeWhereInput | boolean
    delete?: RecipeWhereInput | boolean
    connect?: RecipeWhereUniqueInput
    update?: XOR<XOR<RecipeUpdateToOneWithWhereWithoutUsedAsSubRecipeInput, RecipeUpdateWithoutUsedAsSubRecipeInput>, RecipeUncheckedUpdateWithoutUsedAsSubRecipeInput>
  }

  export type UnitOfMeasureUpdateOneRequiredWithoutRecipeIngredientsNestedInput = {
    create?: XOR<UnitOfMeasureCreateWithoutRecipeIngredientsInput, UnitOfMeasureUncheckedCreateWithoutRecipeIngredientsInput>
    connectOrCreate?: UnitOfMeasureCreateOrConnectWithoutRecipeIngredientsInput
    upsert?: UnitOfMeasureUpsertWithoutRecipeIngredientsInput
    connect?: UnitOfMeasureWhereUniqueInput
    update?: XOR<XOR<UnitOfMeasureUpdateToOneWithWhereWithoutRecipeIngredientsInput, UnitOfMeasureUpdateWithoutRecipeIngredientsInput>, UnitOfMeasureUncheckedUpdateWithoutRecipeIngredientsInput>
  }

  export type RecipeCreateNestedManyWithoutAuthorInput = {
    create?: XOR<RecipeCreateWithoutAuthorInput, RecipeUncheckedCreateWithoutAuthorInput> | RecipeCreateWithoutAuthorInput[] | RecipeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutAuthorInput | RecipeCreateOrConnectWithoutAuthorInput[]
    createMany?: RecipeCreateManyAuthorInputEnvelope
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
  }

  export type RecipeUncheckedCreateNestedManyWithoutAuthorInput = {
    create?: XOR<RecipeCreateWithoutAuthorInput, RecipeUncheckedCreateWithoutAuthorInput> | RecipeCreateWithoutAuthorInput[] | RecipeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutAuthorInput | RecipeCreateOrConnectWithoutAuthorInput[]
    createMany?: RecipeCreateManyAuthorInputEnvelope
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
  }

  export type RecipeUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<RecipeCreateWithoutAuthorInput, RecipeUncheckedCreateWithoutAuthorInput> | RecipeCreateWithoutAuthorInput[] | RecipeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutAuthorInput | RecipeCreateOrConnectWithoutAuthorInput[]
    upsert?: RecipeUpsertWithWhereUniqueWithoutAuthorInput | RecipeUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: RecipeCreateManyAuthorInputEnvelope
    set?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    disconnect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    delete?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    update?: RecipeUpdateWithWhereUniqueWithoutAuthorInput | RecipeUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: RecipeUpdateManyWithWhereWithoutAuthorInput | RecipeUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
  }

  export type RecipeUncheckedUpdateManyWithoutAuthorNestedInput = {
    create?: XOR<RecipeCreateWithoutAuthorInput, RecipeUncheckedCreateWithoutAuthorInput> | RecipeCreateWithoutAuthorInput[] | RecipeUncheckedCreateWithoutAuthorInput[]
    connectOrCreate?: RecipeCreateOrConnectWithoutAuthorInput | RecipeCreateOrConnectWithoutAuthorInput[]
    upsert?: RecipeUpsertWithWhereUniqueWithoutAuthorInput | RecipeUpsertWithWhereUniqueWithoutAuthorInput[]
    createMany?: RecipeCreateManyAuthorInputEnvelope
    set?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    disconnect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    delete?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    connect?: RecipeWhereUniqueInput | RecipeWhereUniqueInput[]
    update?: RecipeUpdateWithWhereUniqueWithoutAuthorInput | RecipeUpdateWithWhereUniqueWithoutAuthorInput[]
    updateMany?: RecipeUpdateManyWithWhereWithoutAuthorInput | RecipeUpdateManyWithWhereWithoutAuthorInput[]
    deleteMany?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumUnitTypeNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.UnitType | EnumUnitTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumUnitTypeNullableFilter<$PrismaModel> | $Enums.UnitType | null
  }

  export type NestedEnumUnitTypeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UnitType | EnumUnitTypeFieldRefInput<$PrismaModel> | null
    in?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.UnitType[] | ListEnumUnitTypeFieldRefInput<$PrismaModel> | null
    not?: NestedEnumUnitTypeNullableWithAggregatesFilter<$PrismaModel> | $Enums.UnitType | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumUnitTypeNullableFilter<$PrismaModel>
    _max?: NestedEnumUnitTypeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type RecipeCreateWithoutCategoryInput = {
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    yieldUnit?: UnitOfMeasureCreateNestedOneWithoutRecipesYieldInput
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityCreateNestedManyWithoutSubRecipeInput
    author?: UserCreateNestedOneWithoutRecipesInput
  }

  export type RecipeUncheckedCreateWithoutCategoryInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityUncheckedCreateNestedManyWithoutSubRecipeInput
  }

  export type RecipeCreateOrConnectWithoutCategoryInput = {
    where: RecipeWhereUniqueInput
    create: XOR<RecipeCreateWithoutCategoryInput, RecipeUncheckedCreateWithoutCategoryInput>
  }

  export type RecipeCreateManyCategoryInputEnvelope = {
    data: RecipeCreateManyCategoryInput | RecipeCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type RecipeUpsertWithWhereUniqueWithoutCategoryInput = {
    where: RecipeWhereUniqueInput
    update: XOR<RecipeUpdateWithoutCategoryInput, RecipeUncheckedUpdateWithoutCategoryInput>
    create: XOR<RecipeCreateWithoutCategoryInput, RecipeUncheckedCreateWithoutCategoryInput>
  }

  export type RecipeUpdateWithWhereUniqueWithoutCategoryInput = {
    where: RecipeWhereUniqueInput
    data: XOR<RecipeUpdateWithoutCategoryInput, RecipeUncheckedUpdateWithoutCategoryInput>
  }

  export type RecipeUpdateManyWithWhereWithoutCategoryInput = {
    where: RecipeScalarWhereInput
    data: XOR<RecipeUpdateManyMutationInput, RecipeUncheckedUpdateManyWithoutCategoryInput>
  }

  export type RecipeScalarWhereInput = {
    AND?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
    OR?: RecipeScalarWhereInput[]
    NOT?: RecipeScalarWhereInput | RecipeScalarWhereInput[]
    id?: IntFilter<"Recipe"> | number
    name?: StringFilter<"Recipe"> | string
    description?: StringNullableFilter<"Recipe"> | string | null
    instructions?: StringFilter<"Recipe"> | string
    yieldQuantity?: DecimalNullableFilter<"Recipe"> | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: IntNullableFilter<"Recipe"> | number | null
    prepTimeMinutes?: IntNullableFilter<"Recipe"> | number | null
    cookTimeMinutes?: IntNullableFilter<"Recipe"> | number | null
    tags?: StringNullableListFilter<"Recipe">
    categoryId?: IntNullableFilter<"Recipe"> | number | null
    userId?: IntNullableFilter<"Recipe"> | number | null
    createdAt?: DateTimeFilter<"Recipe"> | Date | string
    updatedAt?: DateTimeFilter<"Recipe"> | Date | string
  }

  export type IngredientCreateWithoutIngredientCategoryInput = {
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutIngredientInput
  }

  export type IngredientUncheckedCreateWithoutIngredientCategoryInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutIngredientInput
  }

  export type IngredientCreateOrConnectWithoutIngredientCategoryInput = {
    where: IngredientWhereUniqueInput
    create: XOR<IngredientCreateWithoutIngredientCategoryInput, IngredientUncheckedCreateWithoutIngredientCategoryInput>
  }

  export type IngredientCreateManyIngredientCategoryInputEnvelope = {
    data: IngredientCreateManyIngredientCategoryInput | IngredientCreateManyIngredientCategoryInput[]
    skipDuplicates?: boolean
  }

  export type IngredientUpsertWithWhereUniqueWithoutIngredientCategoryInput = {
    where: IngredientWhereUniqueInput
    update: XOR<IngredientUpdateWithoutIngredientCategoryInput, IngredientUncheckedUpdateWithoutIngredientCategoryInput>
    create: XOR<IngredientCreateWithoutIngredientCategoryInput, IngredientUncheckedCreateWithoutIngredientCategoryInput>
  }

  export type IngredientUpdateWithWhereUniqueWithoutIngredientCategoryInput = {
    where: IngredientWhereUniqueInput
    data: XOR<IngredientUpdateWithoutIngredientCategoryInput, IngredientUncheckedUpdateWithoutIngredientCategoryInput>
  }

  export type IngredientUpdateManyWithWhereWithoutIngredientCategoryInput = {
    where: IngredientScalarWhereInput
    data: XOR<IngredientUpdateManyMutationInput, IngredientUncheckedUpdateManyWithoutIngredientCategoryInput>
  }

  export type IngredientScalarWhereInput = {
    AND?: IngredientScalarWhereInput | IngredientScalarWhereInput[]
    OR?: IngredientScalarWhereInput[]
    NOT?: IngredientScalarWhereInput | IngredientScalarWhereInput[]
    id?: IntFilter<"Ingredient"> | number
    name?: StringFilter<"Ingredient"> | string
    description?: StringNullableFilter<"Ingredient"> | string | null
    ingredientCategoryId?: IntNullableFilter<"Ingredient"> | number | null
    createdAt?: DateTimeFilter<"Ingredient"> | Date | string
    updatedAt?: DateTimeFilter<"Ingredient"> | Date | string
  }

  export type RecipeCreateWithoutYieldUnitInput = {
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: CategoryCreateNestedOneWithoutRecipesInput
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityCreateNestedManyWithoutSubRecipeInput
    author?: UserCreateNestedOneWithoutRecipesInput
  }

  export type RecipeUncheckedCreateWithoutYieldUnitInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityUncheckedCreateNestedManyWithoutSubRecipeInput
  }

  export type RecipeCreateOrConnectWithoutYieldUnitInput = {
    where: RecipeWhereUniqueInput
    create: XOR<RecipeCreateWithoutYieldUnitInput, RecipeUncheckedCreateWithoutYieldUnitInput>
  }

  export type RecipeCreateManyYieldUnitInputEnvelope = {
    data: RecipeCreateManyYieldUnitInput | RecipeCreateManyYieldUnitInput[]
    skipDuplicates?: boolean
  }

  export type UnitQuantityCreateWithoutUnitInput = {
    quantity: Decimal | DecimalJsLike | number | string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    recipe: RecipeCreateNestedOneWithoutRecipeIngredientsInput
    ingredient?: IngredientCreateNestedOneWithoutRecipeIngredientsInput
    subRecipe?: RecipeCreateNestedOneWithoutUsedAsSubRecipeInput
  }

  export type UnitQuantityUncheckedCreateWithoutUnitInput = {
    id?: number
    recipeId: number
    ingredientId?: number | null
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityCreateOrConnectWithoutUnitInput = {
    where: UnitQuantityWhereUniqueInput
    create: XOR<UnitQuantityCreateWithoutUnitInput, UnitQuantityUncheckedCreateWithoutUnitInput>
  }

  export type UnitQuantityCreateManyUnitInputEnvelope = {
    data: UnitQuantityCreateManyUnitInput | UnitQuantityCreateManyUnitInput[]
    skipDuplicates?: boolean
  }

  export type RecipeUpsertWithWhereUniqueWithoutYieldUnitInput = {
    where: RecipeWhereUniqueInput
    update: XOR<RecipeUpdateWithoutYieldUnitInput, RecipeUncheckedUpdateWithoutYieldUnitInput>
    create: XOR<RecipeCreateWithoutYieldUnitInput, RecipeUncheckedCreateWithoutYieldUnitInput>
  }

  export type RecipeUpdateWithWhereUniqueWithoutYieldUnitInput = {
    where: RecipeWhereUniqueInput
    data: XOR<RecipeUpdateWithoutYieldUnitInput, RecipeUncheckedUpdateWithoutYieldUnitInput>
  }

  export type RecipeUpdateManyWithWhereWithoutYieldUnitInput = {
    where: RecipeScalarWhereInput
    data: XOR<RecipeUpdateManyMutationInput, RecipeUncheckedUpdateManyWithoutYieldUnitInput>
  }

  export type UnitQuantityUpsertWithWhereUniqueWithoutUnitInput = {
    where: UnitQuantityWhereUniqueInput
    update: XOR<UnitQuantityUpdateWithoutUnitInput, UnitQuantityUncheckedUpdateWithoutUnitInput>
    create: XOR<UnitQuantityCreateWithoutUnitInput, UnitQuantityUncheckedCreateWithoutUnitInput>
  }

  export type UnitQuantityUpdateWithWhereUniqueWithoutUnitInput = {
    where: UnitQuantityWhereUniqueInput
    data: XOR<UnitQuantityUpdateWithoutUnitInput, UnitQuantityUncheckedUpdateWithoutUnitInput>
  }

  export type UnitQuantityUpdateManyWithWhereWithoutUnitInput = {
    where: UnitQuantityScalarWhereInput
    data: XOR<UnitQuantityUpdateManyMutationInput, UnitQuantityUncheckedUpdateManyWithoutUnitInput>
  }

  export type UnitQuantityScalarWhereInput = {
    AND?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
    OR?: UnitQuantityScalarWhereInput[]
    NOT?: UnitQuantityScalarWhereInput | UnitQuantityScalarWhereInput[]
    id?: IntFilter<"UnitQuantity"> | number
    recipeId?: IntFilter<"UnitQuantity"> | number
    ingredientId?: IntNullableFilter<"UnitQuantity"> | number | null
    subRecipeId?: IntNullableFilter<"UnitQuantity"> | number | null
    quantity?: DecimalFilter<"UnitQuantity"> | Decimal | DecimalJsLike | number | string
    unitId?: IntFilter<"UnitQuantity"> | number
    order?: IntFilter<"UnitQuantity"> | number
    createdAt?: DateTimeFilter<"UnitQuantity"> | Date | string
    updatedAt?: DateTimeFilter<"UnitQuantity"> | Date | string
  }

  export type IngredientCategoryCreateWithoutIngredientsInput = {
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IngredientCategoryUncheckedCreateWithoutIngredientsInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IngredientCategoryCreateOrConnectWithoutIngredientsInput = {
    where: IngredientCategoryWhereUniqueInput
    create: XOR<IngredientCategoryCreateWithoutIngredientsInput, IngredientCategoryUncheckedCreateWithoutIngredientsInput>
  }

  export type UnitQuantityCreateWithoutIngredientInput = {
    quantity: Decimal | DecimalJsLike | number | string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    recipe: RecipeCreateNestedOneWithoutRecipeIngredientsInput
    subRecipe?: RecipeCreateNestedOneWithoutUsedAsSubRecipeInput
    unit: UnitOfMeasureCreateNestedOneWithoutRecipeIngredientsInput
  }

  export type UnitQuantityUncheckedCreateWithoutIngredientInput = {
    id?: number
    recipeId: number
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityCreateOrConnectWithoutIngredientInput = {
    where: UnitQuantityWhereUniqueInput
    create: XOR<UnitQuantityCreateWithoutIngredientInput, UnitQuantityUncheckedCreateWithoutIngredientInput>
  }

  export type UnitQuantityCreateManyIngredientInputEnvelope = {
    data: UnitQuantityCreateManyIngredientInput | UnitQuantityCreateManyIngredientInput[]
    skipDuplicates?: boolean
  }

  export type IngredientCategoryUpsertWithoutIngredientsInput = {
    update: XOR<IngredientCategoryUpdateWithoutIngredientsInput, IngredientCategoryUncheckedUpdateWithoutIngredientsInput>
    create: XOR<IngredientCategoryCreateWithoutIngredientsInput, IngredientCategoryUncheckedCreateWithoutIngredientsInput>
    where?: IngredientCategoryWhereInput
  }

  export type IngredientCategoryUpdateToOneWithWhereWithoutIngredientsInput = {
    where?: IngredientCategoryWhereInput
    data: XOR<IngredientCategoryUpdateWithoutIngredientsInput, IngredientCategoryUncheckedUpdateWithoutIngredientsInput>
  }

  export type IngredientCategoryUpdateWithoutIngredientsInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngredientCategoryUncheckedUpdateWithoutIngredientsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUpsertWithWhereUniqueWithoutIngredientInput = {
    where: UnitQuantityWhereUniqueInput
    update: XOR<UnitQuantityUpdateWithoutIngredientInput, UnitQuantityUncheckedUpdateWithoutIngredientInput>
    create: XOR<UnitQuantityCreateWithoutIngredientInput, UnitQuantityUncheckedCreateWithoutIngredientInput>
  }

  export type UnitQuantityUpdateWithWhereUniqueWithoutIngredientInput = {
    where: UnitQuantityWhereUniqueInput
    data: XOR<UnitQuantityUpdateWithoutIngredientInput, UnitQuantityUncheckedUpdateWithoutIngredientInput>
  }

  export type UnitQuantityUpdateManyWithWhereWithoutIngredientInput = {
    where: UnitQuantityScalarWhereInput
    data: XOR<UnitQuantityUpdateManyMutationInput, UnitQuantityUncheckedUpdateManyWithoutIngredientInput>
  }

  export type CategoryCreateWithoutRecipesInput = {
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryUncheckedCreateWithoutRecipesInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CategoryCreateOrConnectWithoutRecipesInput = {
    where: CategoryWhereUniqueInput
    create: XOR<CategoryCreateWithoutRecipesInput, CategoryUncheckedCreateWithoutRecipesInput>
  }

  export type UnitOfMeasureCreateWithoutRecipesYieldInput = {
    name: string
    abbreviation?: string | null
    type?: $Enums.UnitType | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutUnitInput
  }

  export type UnitOfMeasureUncheckedCreateWithoutRecipesYieldInput = {
    id?: number
    name: string
    abbreviation?: string | null
    type?: $Enums.UnitType | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutUnitInput
  }

  export type UnitOfMeasureCreateOrConnectWithoutRecipesYieldInput = {
    where: UnitOfMeasureWhereUniqueInput
    create: XOR<UnitOfMeasureCreateWithoutRecipesYieldInput, UnitOfMeasureUncheckedCreateWithoutRecipesYieldInput>
  }

  export type UnitQuantityCreateWithoutRecipeInput = {
    quantity: Decimal | DecimalJsLike | number | string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    ingredient?: IngredientCreateNestedOneWithoutRecipeIngredientsInput
    subRecipe?: RecipeCreateNestedOneWithoutUsedAsSubRecipeInput
    unit: UnitOfMeasureCreateNestedOneWithoutRecipeIngredientsInput
  }

  export type UnitQuantityUncheckedCreateWithoutRecipeInput = {
    id?: number
    ingredientId?: number | null
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityCreateOrConnectWithoutRecipeInput = {
    where: UnitQuantityWhereUniqueInput
    create: XOR<UnitQuantityCreateWithoutRecipeInput, UnitQuantityUncheckedCreateWithoutRecipeInput>
  }

  export type UnitQuantityCreateManyRecipeInputEnvelope = {
    data: UnitQuantityCreateManyRecipeInput | UnitQuantityCreateManyRecipeInput[]
    skipDuplicates?: boolean
  }

  export type UnitQuantityCreateWithoutSubRecipeInput = {
    quantity: Decimal | DecimalJsLike | number | string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    recipe: RecipeCreateNestedOneWithoutRecipeIngredientsInput
    ingredient?: IngredientCreateNestedOneWithoutRecipeIngredientsInput
    unit: UnitOfMeasureCreateNestedOneWithoutRecipeIngredientsInput
  }

  export type UnitQuantityUncheckedCreateWithoutSubRecipeInput = {
    id?: number
    recipeId: number
    ingredientId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityCreateOrConnectWithoutSubRecipeInput = {
    where: UnitQuantityWhereUniqueInput
    create: XOR<UnitQuantityCreateWithoutSubRecipeInput, UnitQuantityUncheckedCreateWithoutSubRecipeInput>
  }

  export type UnitQuantityCreateManySubRecipeInputEnvelope = {
    data: UnitQuantityCreateManySubRecipeInput | UnitQuantityCreateManySubRecipeInput[]
    skipDuplicates?: boolean
  }

  export type UserCreateWithoutRecipesInput = {
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserUncheckedCreateWithoutRecipesInput = {
    id?: number
    email: string
    name?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCreateOrConnectWithoutRecipesInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRecipesInput, UserUncheckedCreateWithoutRecipesInput>
  }

  export type CategoryUpsertWithoutRecipesInput = {
    update: XOR<CategoryUpdateWithoutRecipesInput, CategoryUncheckedUpdateWithoutRecipesInput>
    create: XOR<CategoryCreateWithoutRecipesInput, CategoryUncheckedCreateWithoutRecipesInput>
    where?: CategoryWhereInput
  }

  export type CategoryUpdateToOneWithWhereWithoutRecipesInput = {
    where?: CategoryWhereInput
    data: XOR<CategoryUpdateWithoutRecipesInput, CategoryUncheckedUpdateWithoutRecipesInput>
  }

  export type CategoryUpdateWithoutRecipesInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CategoryUncheckedUpdateWithoutRecipesInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitOfMeasureUpsertWithoutRecipesYieldInput = {
    update: XOR<UnitOfMeasureUpdateWithoutRecipesYieldInput, UnitOfMeasureUncheckedUpdateWithoutRecipesYieldInput>
    create: XOR<UnitOfMeasureCreateWithoutRecipesYieldInput, UnitOfMeasureUncheckedCreateWithoutRecipesYieldInput>
    where?: UnitOfMeasureWhereInput
  }

  export type UnitOfMeasureUpdateToOneWithWhereWithoutRecipesYieldInput = {
    where?: UnitOfMeasureWhereInput
    data: XOR<UnitOfMeasureUpdateWithoutRecipesYieldInput, UnitOfMeasureUncheckedUpdateWithoutRecipesYieldInput>
  }

  export type UnitOfMeasureUpdateWithoutRecipesYieldInput = {
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUpdateManyWithoutUnitNestedInput
  }

  export type UnitOfMeasureUncheckedUpdateWithoutRecipesYieldInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutUnitNestedInput
  }

  export type UnitQuantityUpsertWithWhereUniqueWithoutRecipeInput = {
    where: UnitQuantityWhereUniqueInput
    update: XOR<UnitQuantityUpdateWithoutRecipeInput, UnitQuantityUncheckedUpdateWithoutRecipeInput>
    create: XOR<UnitQuantityCreateWithoutRecipeInput, UnitQuantityUncheckedCreateWithoutRecipeInput>
  }

  export type UnitQuantityUpdateWithWhereUniqueWithoutRecipeInput = {
    where: UnitQuantityWhereUniqueInput
    data: XOR<UnitQuantityUpdateWithoutRecipeInput, UnitQuantityUncheckedUpdateWithoutRecipeInput>
  }

  export type UnitQuantityUpdateManyWithWhereWithoutRecipeInput = {
    where: UnitQuantityScalarWhereInput
    data: XOR<UnitQuantityUpdateManyMutationInput, UnitQuantityUncheckedUpdateManyWithoutRecipeInput>
  }

  export type UnitQuantityUpsertWithWhereUniqueWithoutSubRecipeInput = {
    where: UnitQuantityWhereUniqueInput
    update: XOR<UnitQuantityUpdateWithoutSubRecipeInput, UnitQuantityUncheckedUpdateWithoutSubRecipeInput>
    create: XOR<UnitQuantityCreateWithoutSubRecipeInput, UnitQuantityUncheckedCreateWithoutSubRecipeInput>
  }

  export type UnitQuantityUpdateWithWhereUniqueWithoutSubRecipeInput = {
    where: UnitQuantityWhereUniqueInput
    data: XOR<UnitQuantityUpdateWithoutSubRecipeInput, UnitQuantityUncheckedUpdateWithoutSubRecipeInput>
  }

  export type UnitQuantityUpdateManyWithWhereWithoutSubRecipeInput = {
    where: UnitQuantityScalarWhereInput
    data: XOR<UnitQuantityUpdateManyMutationInput, UnitQuantityUncheckedUpdateManyWithoutSubRecipeInput>
  }

  export type UserUpsertWithoutRecipesInput = {
    update: XOR<UserUpdateWithoutRecipesInput, UserUncheckedUpdateWithoutRecipesInput>
    create: XOR<UserCreateWithoutRecipesInput, UserUncheckedCreateWithoutRecipesInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRecipesInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRecipesInput, UserUncheckedUpdateWithoutRecipesInput>
  }

  export type UserUpdateWithoutRecipesInput = {
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateWithoutRecipesInput = {
    id?: IntFieldUpdateOperationsInput | number
    email?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecipeCreateWithoutRecipeIngredientsInput = {
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: CategoryCreateNestedOneWithoutRecipesInput
    yieldUnit?: UnitOfMeasureCreateNestedOneWithoutRecipesYieldInput
    usedAsSubRecipe?: UnitQuantityCreateNestedManyWithoutSubRecipeInput
    author?: UserCreateNestedOneWithoutRecipesInput
  }

  export type RecipeUncheckedCreateWithoutRecipeIngredientsInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usedAsSubRecipe?: UnitQuantityUncheckedCreateNestedManyWithoutSubRecipeInput
  }

  export type RecipeCreateOrConnectWithoutRecipeIngredientsInput = {
    where: RecipeWhereUniqueInput
    create: XOR<RecipeCreateWithoutRecipeIngredientsInput, RecipeUncheckedCreateWithoutRecipeIngredientsInput>
  }

  export type IngredientCreateWithoutRecipeIngredientsInput = {
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    ingredientCategory?: IngredientCategoryCreateNestedOneWithoutIngredientsInput
  }

  export type IngredientUncheckedCreateWithoutRecipeIngredientsInput = {
    id?: number
    name: string
    description?: string | null
    ingredientCategoryId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IngredientCreateOrConnectWithoutRecipeIngredientsInput = {
    where: IngredientWhereUniqueInput
    create: XOR<IngredientCreateWithoutRecipeIngredientsInput, IngredientUncheckedCreateWithoutRecipeIngredientsInput>
  }

  export type RecipeCreateWithoutUsedAsSubRecipeInput = {
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: CategoryCreateNestedOneWithoutRecipesInput
    yieldUnit?: UnitOfMeasureCreateNestedOneWithoutRecipesYieldInput
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutRecipeInput
    author?: UserCreateNestedOneWithoutRecipesInput
  }

  export type RecipeUncheckedCreateWithoutUsedAsSubRecipeInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutRecipeInput
  }

  export type RecipeCreateOrConnectWithoutUsedAsSubRecipeInput = {
    where: RecipeWhereUniqueInput
    create: XOR<RecipeCreateWithoutUsedAsSubRecipeInput, RecipeUncheckedCreateWithoutUsedAsSubRecipeInput>
  }

  export type UnitOfMeasureCreateWithoutRecipeIngredientsInput = {
    name: string
    abbreviation?: string | null
    type?: $Enums.UnitType | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipesYield?: RecipeCreateNestedManyWithoutYieldUnitInput
  }

  export type UnitOfMeasureUncheckedCreateWithoutRecipeIngredientsInput = {
    id?: number
    name: string
    abbreviation?: string | null
    type?: $Enums.UnitType | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipesYield?: RecipeUncheckedCreateNestedManyWithoutYieldUnitInput
  }

  export type UnitOfMeasureCreateOrConnectWithoutRecipeIngredientsInput = {
    where: UnitOfMeasureWhereUniqueInput
    create: XOR<UnitOfMeasureCreateWithoutRecipeIngredientsInput, UnitOfMeasureUncheckedCreateWithoutRecipeIngredientsInput>
  }

  export type RecipeUpsertWithoutRecipeIngredientsInput = {
    update: XOR<RecipeUpdateWithoutRecipeIngredientsInput, RecipeUncheckedUpdateWithoutRecipeIngredientsInput>
    create: XOR<RecipeCreateWithoutRecipeIngredientsInput, RecipeUncheckedCreateWithoutRecipeIngredientsInput>
    where?: RecipeWhereInput
  }

  export type RecipeUpdateToOneWithWhereWithoutRecipeIngredientsInput = {
    where?: RecipeWhereInput
    data: XOR<RecipeUpdateWithoutRecipeIngredientsInput, RecipeUncheckedUpdateWithoutRecipeIngredientsInput>
  }

  export type RecipeUpdateWithoutRecipeIngredientsInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: CategoryUpdateOneWithoutRecipesNestedInput
    yieldUnit?: UnitOfMeasureUpdateOneWithoutRecipesYieldNestedInput
    usedAsSubRecipe?: UnitQuantityUpdateManyWithoutSubRecipeNestedInput
    author?: UserUpdateOneWithoutRecipesNestedInput
  }

  export type RecipeUncheckedUpdateWithoutRecipeIngredientsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usedAsSubRecipe?: UnitQuantityUncheckedUpdateManyWithoutSubRecipeNestedInput
  }

  export type IngredientUpsertWithoutRecipeIngredientsInput = {
    update: XOR<IngredientUpdateWithoutRecipeIngredientsInput, IngredientUncheckedUpdateWithoutRecipeIngredientsInput>
    create: XOR<IngredientCreateWithoutRecipeIngredientsInput, IngredientUncheckedCreateWithoutRecipeIngredientsInput>
    where?: IngredientWhereInput
  }

  export type IngredientUpdateToOneWithWhereWithoutRecipeIngredientsInput = {
    where?: IngredientWhereInput
    data: XOR<IngredientUpdateWithoutRecipeIngredientsInput, IngredientUncheckedUpdateWithoutRecipeIngredientsInput>
  }

  export type IngredientUpdateWithoutRecipeIngredientsInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingredientCategory?: IngredientCategoryUpdateOneWithoutIngredientsNestedInput
  }

  export type IngredientUncheckedUpdateWithoutRecipeIngredientsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    ingredientCategoryId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecipeUpsertWithoutUsedAsSubRecipeInput = {
    update: XOR<RecipeUpdateWithoutUsedAsSubRecipeInput, RecipeUncheckedUpdateWithoutUsedAsSubRecipeInput>
    create: XOR<RecipeCreateWithoutUsedAsSubRecipeInput, RecipeUncheckedCreateWithoutUsedAsSubRecipeInput>
    where?: RecipeWhereInput
  }

  export type RecipeUpdateToOneWithWhereWithoutUsedAsSubRecipeInput = {
    where?: RecipeWhereInput
    data: XOR<RecipeUpdateWithoutUsedAsSubRecipeInput, RecipeUncheckedUpdateWithoutUsedAsSubRecipeInput>
  }

  export type RecipeUpdateWithoutUsedAsSubRecipeInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: CategoryUpdateOneWithoutRecipesNestedInput
    yieldUnit?: UnitOfMeasureUpdateOneWithoutRecipesYieldNestedInput
    recipeIngredients?: UnitQuantityUpdateManyWithoutRecipeNestedInput
    author?: UserUpdateOneWithoutRecipesNestedInput
  }

  export type RecipeUncheckedUpdateWithoutUsedAsSubRecipeInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutRecipeNestedInput
  }

  export type UnitOfMeasureUpsertWithoutRecipeIngredientsInput = {
    update: XOR<UnitOfMeasureUpdateWithoutRecipeIngredientsInput, UnitOfMeasureUncheckedUpdateWithoutRecipeIngredientsInput>
    create: XOR<UnitOfMeasureCreateWithoutRecipeIngredientsInput, UnitOfMeasureUncheckedCreateWithoutRecipeIngredientsInput>
    where?: UnitOfMeasureWhereInput
  }

  export type UnitOfMeasureUpdateToOneWithWhereWithoutRecipeIngredientsInput = {
    where?: UnitOfMeasureWhereInput
    data: XOR<UnitOfMeasureUpdateWithoutRecipeIngredientsInput, UnitOfMeasureUncheckedUpdateWithoutRecipeIngredientsInput>
  }

  export type UnitOfMeasureUpdateWithoutRecipeIngredientsInput = {
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipesYield?: RecipeUpdateManyWithoutYieldUnitNestedInput
  }

  export type UnitOfMeasureUncheckedUpdateWithoutRecipeIngredientsInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    abbreviation?: NullableStringFieldUpdateOperationsInput | string | null
    type?: NullableEnumUnitTypeFieldUpdateOperationsInput | $Enums.UnitType | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipesYield?: RecipeUncheckedUpdateManyWithoutYieldUnitNestedInput
  }

  export type RecipeCreateWithoutAuthorInput = {
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: CategoryCreateNestedOneWithoutRecipesInput
    yieldUnit?: UnitOfMeasureCreateNestedOneWithoutRecipesYieldInput
    recipeIngredients?: UnitQuantityCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityCreateNestedManyWithoutSubRecipeInput
  }

  export type RecipeUncheckedCreateWithoutAuthorInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    recipeIngredients?: UnitQuantityUncheckedCreateNestedManyWithoutRecipeInput
    usedAsSubRecipe?: UnitQuantityUncheckedCreateNestedManyWithoutSubRecipeInput
  }

  export type RecipeCreateOrConnectWithoutAuthorInput = {
    where: RecipeWhereUniqueInput
    create: XOR<RecipeCreateWithoutAuthorInput, RecipeUncheckedCreateWithoutAuthorInput>
  }

  export type RecipeCreateManyAuthorInputEnvelope = {
    data: RecipeCreateManyAuthorInput | RecipeCreateManyAuthorInput[]
    skipDuplicates?: boolean
  }

  export type RecipeUpsertWithWhereUniqueWithoutAuthorInput = {
    where: RecipeWhereUniqueInput
    update: XOR<RecipeUpdateWithoutAuthorInput, RecipeUncheckedUpdateWithoutAuthorInput>
    create: XOR<RecipeCreateWithoutAuthorInput, RecipeUncheckedCreateWithoutAuthorInput>
  }

  export type RecipeUpdateWithWhereUniqueWithoutAuthorInput = {
    where: RecipeWhereUniqueInput
    data: XOR<RecipeUpdateWithoutAuthorInput, RecipeUncheckedUpdateWithoutAuthorInput>
  }

  export type RecipeUpdateManyWithWhereWithoutAuthorInput = {
    where: RecipeScalarWhereInput
    data: XOR<RecipeUpdateManyMutationInput, RecipeUncheckedUpdateManyWithoutAuthorInput>
  }

  export type RecipeCreateManyCategoryInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecipeUpdateWithoutCategoryInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    yieldUnit?: UnitOfMeasureUpdateOneWithoutRecipesYieldNestedInput
    recipeIngredients?: UnitQuantityUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUpdateManyWithoutSubRecipeNestedInput
    author?: UserUpdateOneWithoutRecipesNestedInput
  }

  export type RecipeUncheckedUpdateWithoutCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUncheckedUpdateManyWithoutSubRecipeNestedInput
  }

  export type RecipeUncheckedUpdateManyWithoutCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IngredientCreateManyIngredientCategoryInput = {
    id?: number
    name: string
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type IngredientUpdateWithoutIngredientCategoryInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUpdateManyWithoutIngredientNestedInput
  }

  export type IngredientUncheckedUpdateWithoutIngredientCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutIngredientNestedInput
  }

  export type IngredientUncheckedUpdateManyWithoutIngredientCategoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecipeCreateManyYieldUnitInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    userId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityCreateManyUnitInput = {
    id?: number
    recipeId: number
    ingredientId?: number | null
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecipeUpdateWithoutYieldUnitInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: CategoryUpdateOneWithoutRecipesNestedInput
    recipeIngredients?: UnitQuantityUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUpdateManyWithoutSubRecipeNestedInput
    author?: UserUpdateOneWithoutRecipesNestedInput
  }

  export type RecipeUncheckedUpdateWithoutYieldUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUncheckedUpdateManyWithoutSubRecipeNestedInput
  }

  export type RecipeUncheckedUpdateManyWithoutYieldUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    userId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUpdateWithoutUnitInput = {
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipe?: RecipeUpdateOneRequiredWithoutRecipeIngredientsNestedInput
    ingredient?: IngredientUpdateOneWithoutRecipeIngredientsNestedInput
    subRecipe?: RecipeUpdateOneWithoutUsedAsSubRecipeNestedInput
  }

  export type UnitQuantityUncheckedUpdateWithoutUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUncheckedUpdateManyWithoutUnitInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityCreateManyIngredientInput = {
    id?: number
    recipeId: number
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityUpdateWithoutIngredientInput = {
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipe?: RecipeUpdateOneRequiredWithoutRecipeIngredientsNestedInput
    subRecipe?: RecipeUpdateOneWithoutUsedAsSubRecipeNestedInput
    unit?: UnitOfMeasureUpdateOneRequiredWithoutRecipeIngredientsNestedInput
  }

  export type UnitQuantityUncheckedUpdateWithoutIngredientInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUncheckedUpdateManyWithoutIngredientInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityCreateManyRecipeInput = {
    id?: number
    ingredientId?: number | null
    subRecipeId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityCreateManySubRecipeInput = {
    id?: number
    recipeId: number
    ingredientId?: number | null
    quantity: Decimal | DecimalJsLike | number | string
    unitId: number
    order?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UnitQuantityUpdateWithoutRecipeInput = {
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    ingredient?: IngredientUpdateOneWithoutRecipeIngredientsNestedInput
    subRecipe?: RecipeUpdateOneWithoutUsedAsSubRecipeNestedInput
    unit?: UnitOfMeasureUpdateOneRequiredWithoutRecipeIngredientsNestedInput
  }

  export type UnitQuantityUncheckedUpdateWithoutRecipeInput = {
    id?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUncheckedUpdateManyWithoutRecipeInput = {
    id?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    subRecipeId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUpdateWithoutSubRecipeInput = {
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipe?: RecipeUpdateOneRequiredWithoutRecipeIngredientsNestedInput
    ingredient?: IngredientUpdateOneWithoutRecipeIngredientsNestedInput
    unit?: UnitOfMeasureUpdateOneRequiredWithoutRecipeIngredientsNestedInput
  }

  export type UnitQuantityUncheckedUpdateWithoutSubRecipeInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UnitQuantityUncheckedUpdateManyWithoutSubRecipeInput = {
    id?: IntFieldUpdateOperationsInput | number
    recipeId?: IntFieldUpdateOperationsInput | number
    ingredientId?: NullableIntFieldUpdateOperationsInput | number | null
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitId?: IntFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RecipeCreateManyAuthorInput = {
    id?: number
    name: string
    description?: string | null
    instructions: string
    yieldQuantity?: Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: number | null
    prepTimeMinutes?: number | null
    cookTimeMinutes?: number | null
    tags?: RecipeCreatetagsInput | string[]
    categoryId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RecipeUpdateWithoutAuthorInput = {
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: CategoryUpdateOneWithoutRecipesNestedInput
    yieldUnit?: UnitOfMeasureUpdateOneWithoutRecipesYieldNestedInput
    recipeIngredients?: UnitQuantityUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUpdateManyWithoutSubRecipeNestedInput
  }

  export type RecipeUncheckedUpdateWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    recipeIngredients?: UnitQuantityUncheckedUpdateManyWithoutRecipeNestedInput
    usedAsSubRecipe?: UnitQuantityUncheckedUpdateManyWithoutSubRecipeNestedInput
  }

  export type RecipeUncheckedUpdateManyWithoutAuthorInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    instructions?: StringFieldUpdateOperationsInput | string
    yieldQuantity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    yieldUnitId?: NullableIntFieldUpdateOperationsInput | number | null
    prepTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    cookTimeMinutes?: NullableIntFieldUpdateOperationsInput | number | null
    tags?: RecipeUpdatetagsInput | string[]
    categoryId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}