export class Result<T> {
    public code: string;
    public message: string;
    public success: boolean;
    public data: T;
}