import React, { useEffect, useRef, useState } from "react";
import {
  bootstrapCameraKit,
  createMediaStreamSource,
  Transform2D,
} from "@snap/camera-kit";
import { useLocation } from "react-router-dom";

const LENSES = [
  {
    id: "e094eba6-1eff-4cad-824c-82dcd804168b", // Replace with real Lens ID
    groupId: "849f744e-8f7c-45dd-9d08-4e5afc08ce2d", // Replace with real Group ID
    name: "Gold Glasses",
  },
];

export default function FaceScan() {}
