// src/types/mock-profile.ts

// ---------------------------------------------------------------------------
//  Profile shape
// ---------------------------------------------------------------------------

export interface GeneratedProfile {
  id: string;
  gender: "male" | "female";
  name: {
    first: string;
    last: string;
    full: string;
  };
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  dateOfBirth: string; // ISO date string
  age: number;
  username: string;
  avatar: string; // URL to randomuser.me portrait
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
  family: {
    father: {
      name: string;
    };
    mother: {
      name: string;
    };
    siblings: Array<{
      name: string;
      gender: "male" | "female";
      relation: "brother" | "sister";
    }>;
  };
}
