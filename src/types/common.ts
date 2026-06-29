// 基准下拉选项
export interface ReferenceIndexItem {
  value: string;
  label: string;
}

// 基准指数接口返回体
export interface ReferenceIndexRes {
  msg: string;
  errorMsg: string;
  code: number;
  data: ReferenceIndexItem[];
}