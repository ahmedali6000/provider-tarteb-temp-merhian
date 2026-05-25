import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';

const normalizeFileUri = path => {
  if (!path) {
    return '';
  }

  return path.startsWith('file://') ? path : `file://${path}`;
};

const getFilePathForStat = uri => {
  return uri?.replace('file://', '');
};

export const getFileSizeKB = async uri => {
  try {
    const stat = await RNFS.stat(getFilePathForStat(uri));
    return Math.round(Number(stat.size || 0) / 1024);
  } catch (error) {
    return 0;
  }
};

export const compressImageUnderKB = async ({
  uri,
  maxKB = 80,
  maxWidth = 900,
  maxHeight = 650,
  filePrefix = 'image',
}) => {
  let quality = 75;
  let width = maxWidth;
  let height = maxHeight;

  let sourceUri = normalizeFileUri(uri);
  let lastResult = null;

  for (let i = 0; i < 7; i += 1) {
    const result = await ImageResizer.createResizedImage(
      sourceUri,
      width,
      height,
      'JPEG',
      quality,
      0,
      undefined,
      false,
      {
        mode: 'contain',
        onlyScaleDown: true,
      },
    );

    const resultUri = normalizeFileUri(result.uri);
    const sizeKB = await getFileSizeKB(resultUri);

    lastResult = {
      uri: resultUri,
      sizeKB,
      type: 'image/jpeg',
      name: `${filePrefix}_${Date.now()}.jpg`,
    };

    if (sizeKB > 0 && sizeKB <= maxKB) {
      return lastResult;
    }

    quality = Math.max(25, quality - 10);
    width = Math.max(650, Math.round(width * 0.9));
    height = Math.max(430, Math.round(height * 0.9));

    sourceUri = resultUri;
  }

  return lastResult;
};

export const buildImageFormFile = image => {
  return {
    uri: image.uri,
    type: image.type || 'image/jpeg',
    name: image.name || `image_${Date.now()}.jpg`,
  };
};