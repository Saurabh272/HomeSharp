type Image = {
  url: string;
  alt: string;
};

export type Category = {
  name: string;
  slug: string;
  image: Image;
  title: string;
  description: string;
};

export type Categories = {
  categories: Array<Category>;
};
