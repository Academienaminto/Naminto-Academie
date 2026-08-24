import { AppError } from "@/lib/errors";
import * as repo from "@/modules/blog/repository";
import type {
  CreateCommentInput,
  CreatePostInput,
  UpdatePostInput,
} from "@/modules/blog/validation";

export function createPost(authorId: string, input: CreatePostInput) {
  return repo.createPost(authorId, input);
}

export async function updatePost(id: string, input: UpdatePostInput) {
  const post = await repo.findPostById(id);
  if (!post) {
    throw new AppError("RESOURCE_NOT_FOUND", "Article introuvable.");
  }
  return repo.updatePost(id, input);
}

export async function setPostStatus(id: string, status: string) {
  const post = await repo.findPostById(id);
  if (!post) {
    throw new AppError("RESOURCE_NOT_FOUND", "Article introuvable.");
  }
  return repo.setPostStatus(id, status);
}

export function listPublished() {
  return repo.listPublished();
}

export function listAllPosts() {
  return repo.listAllPosts();
}

/** Un visiteur/membre ne peut consulter que les articles publiés ; le
 * Seuil (MANAGE_BLOG) peut prévisualiser un brouillon. */
export async function getPost(id: string, canManageAll: boolean) {
  const post = await repo.findPostById(id);
  if (!post || (post.status !== "PUBLIE" && !canManageAll)) {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Article introuvable.",
      undefined,
      "blog.postNotFound",
    );
  }
  const comments = canManageAll
    ? await repo.listAllCommentsForPost(id)
    : await repo.listCommentsForPost(id);
  return { post, comments };
}

export async function addComment(
  blogPostId: string,
  userId: string,
  input: CreateCommentInput,
) {
  const post = await repo.findPostById(blogPostId);
  if (!post || post.status !== "PUBLIE") {
    throw new AppError(
      "RESOURCE_NOT_FOUND",
      "Article introuvable ou non publié.",
      undefined,
      "blog.postNotFoundOrUnpublished",
    );
  }
  return repo.createComment(blogPostId, userId, input.content);
}

export async function moderateComment(id: string, status: string) {
  const comment = await repo.findCommentById(id);
  if (!comment) {
    throw new AppError("RESOURCE_NOT_FOUND", "Commentaire introuvable.");
  }
  return repo.moderateComment(id, status);
}
