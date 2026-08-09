declare module "react-simple-maps" {
  import type { ComponentType, ReactNode } from "react";

  type Coordinates = [number, number];

  type MapStyle = {
    default?: Record<string, string | number>;
    hover?: Record<string, string | number>;
    pressed?: Record<string, string | number>;
  };

  type Geography = {
    rsmKey: string;
    properties?: Record<string, string | number | null>;
    [key: string]: unknown;
  };

  type GeographyCollectionProps = {
    geography: unknown;
    children: (args: { geographies: Geography[] }) => ReactNode;
  };

  type GeographyProps = {
    geography: Geography;
    style?: MapStyle;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };

  type ZoomMove = {
    coordinates: Coordinates;
    zoom: number;
  };

  type ComposableMapProps = {
    children?: ReactNode;
    width?: number;
    height?: number;
    projection?: string;
    projectionConfig?: Record<string, string | number | Coordinates>;
    className?: string;
  };

  type ZoomableGroupProps = {
    children?: ReactNode;
    center?: Coordinates;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    onMoveEnd?: (position: ZoomMove) => void;
  };

  type MarkerProps = {
    coordinates: Coordinates;
    children?: ReactNode;
  };

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographyCollectionProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Graticule: ComponentType<{ stroke?: string; strokeWidth?: number; strokeOpacity?: number }>;
  export const Marker: ComponentType<MarkerProps>;
  export const Sphere: ComponentType<{ stroke?: string; strokeWidth?: number; fill?: string }>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}
