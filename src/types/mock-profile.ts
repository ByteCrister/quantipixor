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
  dateOfBirth: string;
  age: number;
  username: string;
  avatar: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
  };
}
