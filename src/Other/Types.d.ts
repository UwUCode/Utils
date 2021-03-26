/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
export type FilterFlags<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : never;
};
export type InvertedFilterFlags<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? never : Key;
};
export type FilterReturnType<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends (...args: Array<any>) => any ? ReturnType<Base[Key]> extends Condition ? Key : never : never;
};
export type InvertedFilterReturnType<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends (...args: Array<any>) => any ? ReturnType<Base[Key]> extends Condition ? never : Key : never;
};
export type AllowedNames<Base, Condition> = FilterFlags<Base, Condition>[keyof Base];
export type BetterFilter<Base, Condition> = Pick<Base, keyof Omit<Base, AllowedNames<Base, Condition>>>;
export type WithoutFunctions<T> = BetterFilter<T, Function>;
export type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type WithOptional<T, O extends keyof T> = Omit<T, O> & DeepPartial<Pick<T, O>>;
export type SomeOptional<T, R extends keyof T = never> = WithOptional<T, keyof Without<T, R>>;
export type DeepPartial<T> = {
	[P in keyof T]?: Partial<T[P]>;
};
export type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
export type ThenReturnType<T extends (...args: any) => any> = ThenArg<ReturnType<T>>;
export type OmitFirstArg<T> = T extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;
export type valueof<T> = T[keyof T];
export type ArrayOrObject<T = unknown> = Array<T> | { [K in keyof T]: T[K]; };
export type Nullable<T, I = never> = { [K in keyof T]: K extends I ? T[K] : T[K] extends AnyObject ? Nullable<T[K]> : T[K] | null; };
export type CallbackFunction<E = Error, R = unknown> = (err: E, res?: R) => void;
export type ArrayOneOrMore<T> = Array<T> & {
	0: T;
};
export type KnownKeys<T> = {
	[K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U } ? U : never;
export type AnyObject<T = unknown> = Record<string, T>;
export type AnyFunction<A extends Array<unknown> = Array<unknown>, B = unknown> = (...args: A) => B;
export type ModuleImport<T> = Record<"default", T>;
export type PartialRecord<K extends string | number | symbol, T> = Partial<Record<K, T>>;
export type KeysOfUnion<T> = T extends T ? keyof T : never;
export type ValuesOfUnion<T> = T extends T ? T[keyof T] : never;
export type Writeable<T extends { [k in string | number | symbol]: unknown; }, K extends (string | number | symbol) = keyof T> = {
	[P in K]: T[P];
};
