class Cube {
  constructor() {
    // this.table = tables;
    // console.log(this.table);
    // this.cols = [];
    this.dimension = [];
    this.tables = [];

  }

  set table(values) {
    this.tables = values;
    this.dimension = this.tables;
  }

  set columns(values) {
    this.cols = values;
    this.dimension[this.tables] = this.cols;
    console.log(this.dimension);
  }




}
