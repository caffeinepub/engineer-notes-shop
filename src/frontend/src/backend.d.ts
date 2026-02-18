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
export interface Category {
    id: string;
    icon: string;
    name: string;
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
    category: string;
    priceInCents: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimStoreOwnership(): Promise<void>;
    createCategory(id: string, name: string, icon: string): Promise<void>;
    createProduct(id: string, title: string, author: string, priceInCents: bigint, categoryId: string): Promise<void>;
    deleteCategory(id: string): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    downloadProductFile(productId: string): Promise<ExternalBlob>;
    getAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategories(): Promise<Array<Category>>;
    getCategory(id: string): Promise<Category>;
    getProduct(productId: string): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getPurchasedProductIds(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdminSystemInitialized(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStoreClaimable(): Promise<boolean>;
    listStorefrontProducts(): Promise<ProductList>;
    listStorefrontProductsByCategory(categoryId: string): Promise<ProductList>;
    purchaseProduct(productId: string): Promise<void>;
    saveCallerUserProfile(userProfile: UserProfile): Promise<UserProfile>;
    setAdminInitialized(): Promise<void>;
    setProductPublished(id: string, isPublished: boolean): Promise<void>;
    updateProduct(id: string, title: string, author: string, priceInCents: bigint, categoryId: string): Promise<void>;
    uploadProductFile(id: string, blob: ExternalBlob): Promise<void>;
}
