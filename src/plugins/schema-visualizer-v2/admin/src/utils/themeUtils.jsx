import { darkTheme } from '@strapi/design-system';

// In Strapi v5, field icons are now in the symbols export
import {
  TextField,
  EmailField,
  PasswordField,
  NumberField,
  EnumerationField,
  DateField,
  MediaField,
  BooleanField,
  JsonField,
  BlocksField,
  RelationField,
  UidField,
} from '@strapi/icons/symbols';
import {
  OneToMany,
  OneToOne,
  ManyToMany,
  ManyToOne,
  OneWay,
  ManyWays,
} from '@strapi/icons';

export function getBackgroundColor(variant, theme) {
  switch (variant) {
    case 'cross':
      return theme.colors.neutral200;
    case 'dots':
      return darkTheme.colors.neutral300;
    case 'lines':
      return theme.colors.neutral150;
    case 'none':
      return theme.colors.neutral100;
  }
}

export function getIcon(attrType) {
  switch (attrType.toLowerCase()) {
    case 'string':
    case 'text':
      return <TextField />;
    case 'email':
      return <EmailField />;
    case 'enumeration':
      return <EnumerationField />;
    case 'password':
      return <PasswordField />;
    case 'boolean':
      return <BooleanField />;
    case 'relation':
      return <RelationField />;
    case 'datetime':
    case 'date':
    case 'time':
      return <DateField />;
    case 'integer':
    case 'decimal':
    case 'biginteger':
    case 'float':
      return <NumberField />;
    case 'json':
      return <JsonField />;
    case 'uid':
      return <UidField />;
    case 'richtext':
      return <TextField />;
    case 'media':
      return <MediaField />;
    case 'blocks':
      return <BlocksField />;

    case 'onetomany': //
      return <OneToMany />;
    case 'oneway':
      return <OneWay />;
    case 'onetoone': //
      return <OneToOne />;
    case 'manytomany': //
      return <ManyToMany />;
    case 'manytoone': //
      return <ManyToOne />;
    case 'manyways':
    // Not sure
    case 'morphtomany':
      return <ManyWays />;
  }
}
