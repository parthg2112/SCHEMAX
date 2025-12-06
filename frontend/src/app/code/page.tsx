"use client"

import * as React from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { FileExplorer, FileNode } from "@/components/code/file-explorer"
import { CodeViewer } from "@/components/code/code-viewer"

const MOCK_FILES: FileNode[] = [
    {
        id: "root",
        name: "prisma",
        type: "folder",
        children: [
            {
                id: "schema",
                name: "schema.prisma",
                type: "file",
                language: "prisma",
                content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  orders        Order[]
}

model Product {
  id          String      @id @default(cuid())
  name        String
  price       Decimal
  stock       Int
  orderItems  OrderItem[]
}

model Order {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id])
  status      String
  createdAt   DateTime    @default(now())
  items       OrderItem[]
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  quantity    Int
  price       Decimal
}
`
            },
            {
                id: "migrations",
                name: "migrations",
                type: "folder",
                children: [
                    {
                        id: "migration_sql",
                        name: "migration.sql",
                        type: "file",
                        language: "sql",
                        content: `-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
`
                    }
                ]
            }
        ]
    },
    {
        id: "types",
        name: "types.ts",
        type: "file",
        language: "typescript",
        content: `export type User = {
  id: string;
  email: string;
  createdAt: Date;
};

export type Product = {
  id: string;
  name: string;
  price: number;
};
`
    }
]

export default function CodePage() {
    const [selectedFile, setSelectedFile] = React.useState<FileNode | null>(MOCK_FILES[0].children![0])

    const handleDownload = () => {
        alert("Downloading generated code as ZIP...")
    }

    return (
        <div className="h-screen w-full pt-20 pb-4 px-4 flex flex-col">
            <div className="flex-1 rounded-xl border bg-background shadow-sm overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                    <div className="text-sm font-medium">
                        {selectedFile ? selectedFile.name : "No file selected"}
                    </div>
                    <Button size="sm" onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download ZIP
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden">
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                            <FileExplorer
                                files={MOCK_FILES}
                                selectedFileId={selectedFile?.id || null}
                                onSelectFile={setSelectedFile}
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={75}>
                            {selectedFile && selectedFile.content ? (
                                <CodeViewer
                                    code={selectedFile.content}
                                    language={selectedFile.language || "plaintext"}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    Select a file to view content
                                </div>
                            )}
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </div>
        </div>
    )
}
