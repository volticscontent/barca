"use client";

import { useEffect } from "react";
import * as fpixel from "../lib/fpixel";

interface ViewContentProps {
  contentName: string;
  contentIds: string[];
  contentType: string;
  value: number;
  currency: string;
}

const TrackViewContent = ({
  contentName,
  contentIds,
  contentType,
  value,
  currency,
}: ViewContentProps) => {
  useEffect(() => {
    fpixel.event("ViewContent", {
      content_name: contentName,
      content_ids: contentIds,
      content_type: contentType,
      value: value,
      currency: currency,
    });
  }, [contentName, contentIds, contentType, value, currency]);

  return null;
};

export default TrackViewContent;
