import React from 'react';
import { View } from 'react-native';

const MapView = ({ children, style }) => React.createElement(View, { style }, children);
MapView.Animated = MapView;

export const Marker = () => null;
export const Polyline = () => null;
export const Circle = () => null;
export const Polygon = () => null;
export const Callout = () => null;
export const PROVIDER_GOOGLE = null;
export const PROVIDER_DEFAULT = null;

export default MapView;
