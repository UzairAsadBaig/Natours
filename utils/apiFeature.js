class APIfeatures {
  constructor(query, queryReq) {
    this.query = query;
    this.queryReq = queryReq;
  }

  filter() {
    //Filtering the response
    let filteredQuery = { ...this.queryReq };
    const ignoreFields = ['page', 'sort', 'limit', 'field'];
    ignoreFields.forEach((e) => delete filteredQuery[e]);
    filteredQuery = JSON.parse(
      JSON.stringify(filteredQuery).replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      )
    );
    this.query = this.query.find(filteredQuery);
    return this;
  }

  sort() {
    // Sorting the response
    this.query = this.queryReq.sort
      ? this.query.sort(this.queryReq.sort.replace(/,/g, ' '))
      : this.query.sort('-createdAt');
    return this;
  }

  project() {
    //Implementing Projection
    this.query = this.queryReq.field
      ? this.query.select(this.queryReq.field.replace(/,/g, ' '))
      : this.query.select('-__v');
    return this;
  }

  paginate() {
    //Implementing pagination
    const limit = +this.queryReq.limit || 100;
    const skip = (+this.queryReq.page - 1) * limit || 0;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIfeatures;
