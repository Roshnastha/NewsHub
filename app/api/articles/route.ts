import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true }
        }
      }
    });

    const parsed = articles.map((article) => ({
      ...article,
      tags: Array.isArray(article.tags)
        ? article.tags
        : article.tags
          ? [article.tags]
          : [],
    }));

    return NextResponse.json({ articles: parsed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title, content, excerpt, category,
      imageUrl, videoUrl, tags, featured,
      aiResult, aiConfidence, aiVerified, authorId
    } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: "Title, content and authorId are required" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt,
        category,
        imageUrl,
        videoUrl,
        tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
        featured: featured || false,
        aiResult,
        aiConfidence,
        aiVerified: aiVerified || false,
        authorId,
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}