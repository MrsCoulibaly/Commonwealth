export type ChildSpaceTabId = 'profil' | 'carnet' | 'sante';

export type ChildSpaceEnrollment = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  schoolYear: string;
  levelName: string;
  className: string;
  headTeacher: string | null;
  enrollmentDate: string;
  enrollmentDateDisplay: string;
};

export type ChildSpaceChild = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string | null;
  birthDisplay: string;
  gender: 'FEMALE' | 'MALE' | 'UNSPECIFIED';
  genderLabel: string;
  ageLabel: string;
  allergies: string[];
  allergiesRaw: string | null;
  matricule: string;
  address: string | null;
  photoUrl: string | null;
};

export type ChildSpaceParent = {
  fullName: string | null;
  email: string;
  phone: string | null;
  relationLabel: 'Père' | 'Mère' | null;
};

export type FollowUpNoteItem = {
  id: string;
  category: 'ACTIVITY' | 'MEAL' | 'NAP' | 'MOOD' | 'CARE';
  content: string;
  rating: number | null;
  noteDate: string;
  timeLabel: string;
  publishedAt: string | null;
};

export type HealthVaccination = {
  id: string;
  name: string;
  status: 'DONE' | 'MISSING';
  vaccinatedAt: string | null;
  dateLabel: string | null;
};

export type HealthRecord = {
  id: string;
  childId: string;
  bloodGroup: string;
  doctorName: string;
  doctorPhone: string;
  knownAllergies: string;
  ongoingTreatments: string;
  dietaryRegime: string;
  instructions: string;
  schoolSignatureType: string | null;
  schoolSignatureText: string | null;
  schoolSignatureUrl: string | null;
  schoolSignedAt: string | null;
  schoolSignedByName: string | null;
  schoolSigned: boolean;
  parentSignatureUrl: string | null;
  parentSignedAt: string | null;
  parentSigned: boolean;
  parentSignatureRequestedAt: string | null;
  awaitingParentSignature: boolean;
  vaccinations: HealthVaccination[];
};

export type ParentChildSpacePayload = {
  child: ChildSpaceChild;
  enrollment: ChildSpaceEnrollment | null;
  parent: ChildSpaceParent | null;
  followUpNotes: { items: FollowUpNoteItem[] };
  healthRecord: HealthRecord | null;
};
