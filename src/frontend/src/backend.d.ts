import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type ProductList = Array<Product>;
export interface UserProfile {
    name: string;
}
export interface Product {
    id: string;
    title: string;
    isPublished: boolean;
    file?: ExternalBlob;
    author: string;
    priceInCents: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(id: string, title: string, author: string, priceInCents: bigint): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    downloadProductFile(productId: string): Promise<ExternalBlob>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(productId: string): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getPurchasedProductIds(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listStorefrontProducts(): Promise<ProductList>;
    purchaseProduct(productId: string): Promise<void>;
    saveCallerUserProfile(userProfile: UserProfile): Promise<UserProfile>;
    setProductPublished(id: string, isPublished: boolean): Promise<void>;
    updateProduct(id: string, title: string, author: string, priceInCents: bigint): Promise<void>;
    uploadProductFile(id: string, blob: ExternalBlob): Promise<void>;
}
