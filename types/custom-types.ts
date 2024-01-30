type UserDefinedType  = 'freelancer' | 'buyer';

export interface UserType {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    photo: string;
    type: UserDefinedType;
    isBlocked: boolean;
    isEmailVerified: boolean;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}