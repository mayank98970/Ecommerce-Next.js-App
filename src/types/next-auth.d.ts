

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
} 