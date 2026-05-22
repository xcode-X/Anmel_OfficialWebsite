/** Document field names on student / scholarship application forms (matches backend mediaFields.js). */
export const APPLICATION_DOC_FIELDS = [
  'passportPhoto',
  'oLevelCertificate',
  'aLevelCertificate',
  'highSchoolDiploma',
  'waecResult',
  'academicTranscript',
  'bachelorDegree',
  'masterDegree',
  'englishProficiency',
  'healthCertificate',
  'passportBioPage',
  'recommendationLetters',
  'personalStatement',
  'cvResume',
  'otherDocuments',
];

export function submittedDocFieldsFrom(body) {
  return APPLICATION_DOC_FIELDS.filter((f) => {
    const v = body?.[f];
    return typeof v === 'string' && v.trim().length > 0;
  });
}

/** When files are not uploaded to Storage — track which fields the applicant selected. */
export function submittedDocFieldsFromFileNames(fileNames = {}) {
  return APPLICATION_DOC_FIELDS.filter((f) => fileNames[f]);
}

export function enrichApplicationRecord(body, { submittedDocFields } = {}) {
  const fields = submittedDocFields ?? submittedDocFieldsFrom(body);
  return {
    ...body,
    submittedDocFields: fields,
    documentsCount: fields.length,
  };
}
