"use client";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoaderCircle } from "lucide-react";
import { ThemeTokens } from "@/app/config";

interface ExtractChapters {
  _id: string;
  novelId: string;
  userId: string;
  parentId: string;
  type: string;
  title: string;
  description: string;
  loading: boolean;
  stats?: {
    wordCount: number;
  };
  children?: ExtractChapters[];
}

interface ExtractListProps {
  extractChapters: ExtractChapters[];
  style: ThemeTokens;
  handleCheckedChange: (e: any, item: any) => void;
}

export default function ExtractList({
  extractChapters,
  style,
  handleCheckedChange,
}: ExtractListProps) {
  return (
    <ScrollArea className="h-[75vh] sm:h-[80vh]">
      <div className="p-4">
        {
          // @ts-ignore
          extractChapters.map((chapters) => (
            <div className=" max-w-80">
              <div
                className="rounded-lg  transition-all mb-4 mr-6"
                style={{
                  width: "85%",
                  backgroundColor: style.backgroundImage ? `` : style.mainColor,
                }}
              >
                <div className="flex items-center p-4">
                  <h2
                    title={chapters.title}
                    style={{ width: "100%" }}
                    className="text-lg font-bold overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                  >
                    {chapters.title}
                  </h2>
                </div>
                <div
                  title={chapters.description}
                  className="pl-4 pr-4 w-full text-sm  text-ellipsis line-clamp-3 cursor-pointer"
                >
                  <span>{chapters.description}</span>
                </div>

                <div>
                  {
                    // @ts-ignore
                    chapters.children.map((item) => (
                      <div className="mb-4 pl-4 pr-4 pb-4">
                        <div className="flex items-center justify p-4">
                          <Checkbox
                            id={item._id}
                            onCheckedChange={(e) =>
                              handleCheckedChange(e, item)
                            }
                          />
                          <Label htmlFor={item._id} className="w-72 ml-2 ">
                            <h3
                              title={item.title}
                              className="w-48 font-bold overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                            >
                              {item.title}
                            </h3>
                          </Label>
                        </div>
                        <div
                          title={item.description}
                          className="pl-4 pr-4 w-full text-sm  text-ellipsis line-clamp-3 cursor-pointer"
                        >
                          {item.loading ? (
                            <div className="w-full flex justify-center items-center">
                              <LoaderCircle
                                className="w-6 h-6 animate-spin"
                                style={{ color: style.textColor }}
                              />
                            </div>
                          ) : (
                            <span>{item.description}</span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </ScrollArea>
  );
}
