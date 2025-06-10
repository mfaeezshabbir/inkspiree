// Pre-defined Konva components with proper loading for Next.js
"use client";

import dynamic from "next/dynamic";
import React from "react";

// Create a component that wraps the dynamic import to prevent the "default" error
const createDynamicComponent = <T extends React.ElementType>(
  componentName: string,
  loader: () => Promise<T>
): React.ComponentType<React.ComponentProps<T>> => {
  const DynamicComponent = dynamic(
    async () => {
      const konvaModule = await loader();
      // Return a React component that renders the Konva component
      const Component: React.FC<React.ComponentProps<T>> = (props) => {
        return React.createElement(konvaModule, props);
      };
      Component.displayName = `Dynamic${componentName}`;
      return Component;
    },
    { ssr: false }
  );
  
  return DynamicComponent;
};

// Export components using the safer approach
export const Stage = createDynamicComponent("Stage", 
  () => import("react-konva").then(mod => mod.Stage)
);

export const Layer = createDynamicComponent("Layer", 
  () => import("react-konva").then(mod => mod.Layer)
);

export const Rect = createDynamicComponent("Rect",
  () => import("react-konva").then(mod => mod.Rect)
);

export const Text = createDynamicComponent("Text",
  () => import("react-konva").then(mod => mod.Text)
);

export const Circle = createDynamicComponent("Circle",
  () => import("react-konva").then(mod => mod.Circle)
);

export const Line = createDynamicComponent("Line",
  () => import("react-konva").then(mod => mod.Line)
);

export const RegularPolygon = createDynamicComponent("RegularPolygon",
  () => import("react-konva").then(mod => mod.RegularPolygon)
);

export const Image = createDynamicComponent("Image",
  () => import("react-konva").then(mod => mod.Image)
);

export const Arrow = createDynamicComponent("Arrow",
  () => import("react-konva").then(mod => mod.Arrow)
);

export const Star = createDynamicComponent("Star",
  () => import("react-konva").then(mod => mod.Star)
);

export const Group = createDynamicComponent("Group",
  () => import("react-konva").then(mod => mod.Group)
);

// Transformer is useful for resizing elements
export const Transformer = createDynamicComponent("Transformer",
  () => import("react-konva").then(mod => mod.Transformer)
);
