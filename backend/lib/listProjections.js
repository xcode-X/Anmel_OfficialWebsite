/** Aggregation helpers: list metadata without shipping base64 blobs over the wire. */

function remoteUrlOrRemove(fieldName) {
  const img = { $ifNull: [`$${fieldName}`, ''] };
  return {
    $let: {
      vars: { img },
      in: {
        $cond: [
          {
            $or: [
              { $eq: [{ $substrBytes: ['$$img', 0, 8] }, 'https://'] },
              { $eq: [{ $substrBytes: ['$$img', 0, 7] }, 'http://'] },
            ],
          },
          '$$img',
          '$$REMOVE',
        ],
      },
    },
  };
}

export function universityPublicListPipeline() {
  return [
    { $sort: { createdAt: -1 } },
    {
      $project: {
        name: 1,
        country: 1,
        idName: 1,
        description: 1,
        ranking: 1,
        founded: 1,
        students: 1,
        website: 1,
        courses: 1,
        createdAt: 1,
        hasImage: { $gt: [{ $strLenCP: { $ifNull: ['$image', ''] } }, 0] },
        image: remoteUrlOrRemove('image'),
      },
    },
  ];
}

export function scholarshipPublicListPipeline() {
  return [
    { $match: { isPublished: true } },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        title: 1,
        university: 1,
        country: 1,
        deadline: 1,
        scholarshipType: 1,
        fundingStatus: 1,
        eligibility: 1,
        description: 1,
        applicationLink: 1,
        amount: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        hasThumbnail: { $gt: [{ $strLenCP: { $ifNull: ['$thumbnail', ''] } }, 0] },
        thumbnail: remoteUrlOrRemove('thumbnail'),
      },
    },
  ];
}
