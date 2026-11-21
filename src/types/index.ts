export type Role = "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
export type MemberRole = Role;
export type ViewRole = "user" | "admin";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type MemberStatus = UserStatus;

export type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE"
  | "UNKNOWN"
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type MembershipType =
  | "GENERAL"
  | "LIFETIME"
  | "DONOR"
  | "HONORARY"
  | "STUDENT"
  | "PERMANENT"
  | "PLAYER_QUOTA";

export interface Member {
  id: string;
  fullName: string;
  email: string;
  fatherName?: string | null;
  motherName?: string | null;
  phoneNumber?: string | null;
  bloodGroup: BloodGroup;
  bio?: string | null;
  summary?: string | null;
  status: MemberStatus;
  role: MemberRole;
  profession?: string | null;
  village?: string | null;
  currentLocation?: string | null;
  whatsappNumber?: string | null;
  membershipType: MembershipType;
  facebookProfile?: string | null;
  profileImage?: string | null;
  authProvider: "EMAIL" | "GOOGLE";
  emailVerified: boolean;
  phoneVerified: boolean;
  adminVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembersListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    members: Member[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export type ExecutiveType = "COMMITTEE" | "ADVISORY" | "GENERAL";

export interface Executive {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  roleEn: string;
  roleBn: string;
  type: ExecutiveType;
  image?: string | null;
  imagePublicId?: string | null;
  joiningYear: string;
  isKeyLeader: boolean;
  order: number;
  villageEn: string;
  villageBn: string;
  summaryEn: string;
  summaryBn: string;
  keyContributionEn: string[];
  keyContributionBn: string[];
  mottoEn?: string | null;
  mottoBn?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutivesListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    executives: Executive[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  provider: "google" | "credentials";
  authProvider?: string | null;
  googleId?: string | null;
  role: Role;
  status?: UserStatus;
  emailVerified?: boolean | null;
  adminVerified?: string | boolean | null;
  adminApproved?: string | boolean | null;

  // Profile update fields matching Prisma schema
  fullName?: string;
  profileImage?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  membershipType?: MembershipType | null;
  fatherName?: string | null;
  motherName?: string | null;
  bloodGroup?: BloodGroup | string | null;
  bio?: string | null;
  summary?: string | null;
  profession?: string | null;
  village?: string | null;
  currentLocation?: string | null;
  whatsappNumber?: string | null;
  facebookProfile?: string | null;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
              expires_in?: number;
            }) => void;
            error_callback?: (error: unknown) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}
