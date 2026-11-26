import ImageConverter from './image-converter';

export const metadata = {
  title: 'Image Converter — Convert PNG, JPG & WebP Online',
  description:
    'Convert images to PNG, JPG, or WebP and resize them in your browser. Your selected image stays on your device.',
};

export default function ImageConverterPage() {
  return <ImageConverter />;
}
