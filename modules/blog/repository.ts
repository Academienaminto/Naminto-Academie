import { db } from "@/lib/db";
import type { CreatePostInput, UpdatePostInput } from "@/modules/blog/validation";

export function createPost(authorId: string, input: CreatePostInput) {
  return db.blogPost.create({
    data: { authorId, ...input, status: "BROUILLON" },
  });
}

export function findPostById(id: string) {
  return db.blogPost.findUnique({ where: { id } });
}

export function updatePost(id: string, input: UpdatePostInput) {
  return db.blogPost.update({ where: { id }, data: input });
}

export function setPostStatus(id: string, status: string) {
  const data: { status: string; publishedAt?: Date } = { status };
  if (status === "PUBLIE") {
    data.publishedAt = new Date();
  }
  return db.blogPost.update({ where: { id }, data });
}

export function listPublished() {
  return db.blogPost.findMany({
    where: { status: "PUBLIE" },
    orderBy: { publishedAt: "desc" },
  });
}

export function listAllPosts() {
  return db.blogPost.findMany({ orderBy: { createdAt: "desc" } });
}

export function createComment(
  blogPostId: string,
  userId: string,
  content: string,
) {
  return db.comment.create({
    data: {
      blogPostId,
      userId,
      content,
      status: "PUBLIE",
      publishedAt: new Date(),
    },
  });
}

export function listCommentsForPost(blogPostId: string) {
  return db.comment.findMany({
    where: { blogPostId, status: "PUBLIE" },
    orderBy: { createdAt: "asc" },
    include: { user: { include: { profile: true } } },
  });
}

export function findCommentById(id: string) {
  return db.comment.findUnique({ where: { id } });
}

export function moderateComment(id: string, status: string) {
  return db.comment.update({
    where: { id },
    data: { status, moderatedAt: new Date() },
  });
}
