function makeBookmarksArray() {
  return [
    {
      id: 1,
      title: 'first test bookmark',
      url: 'https://www.test.com',
      rating: 3,
      description: 'test desc',
    },
    {
      id: 2,
      title: 'second test bookmark',
      url: 'https://www.test.com',
      rating: 4,
      description: 'test desc',
    },
    {
      id: 3,
      title: 'third test bookmark',
      url: 'https://www.test.com',
      rating: 2,
      description: 'test desc',
    },
  ];
}

module.exports = { makeBookmarksArray };
