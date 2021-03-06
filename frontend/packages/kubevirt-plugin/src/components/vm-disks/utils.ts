import * as classNames from 'classnames';
import { Kebab } from '@console/internal/components/utils';

export const diskTableColumnClasses = [
  classNames('col-lg-2'),
  classNames('col-lg-2'),
  classNames('col-lg-2'),
  classNames('col-lg-2'),
  classNames('col-lg-2'),
  Kebab.columnClass,
];

export const cdTableColumnClasses = [
  classNames('col-lg-4'),
  classNames('col-lg-4'),
  classNames('col-lg-4'),
  Kebab.columnClass,
];
