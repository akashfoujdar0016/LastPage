import mongoose, { Schema, model } from 'mongoose';

const models = mongoose.models || {};
const opts = { timestamps: true };

// User Schema
const UserSchema = new Schema(
  {
    username: { type: String, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: String,
    displayName: String,
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['MEMBER', 'MODERATOR', 'ADMIN'], default: 'MEMBER' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    favoriteGenres: [{ type: String }],
    privacy: {
      profile: { type: String, enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'], default: 'PUBLIC' },
      activity: { type: String, enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'], default: 'FOLLOWERS' },
      lists: { type: String, enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'], default: 'PUBLIC' },
    },
    blockedUserIds: [Schema.Types.ObjectId],
  },
  opts
);

// Content Schema
const ContentSchema = new Schema(
  {
    type: { type: String, enum: ['MOVIE', 'BOOK'], index: true },
    title: { type: String, index: true },
    slug: { type: String, index: true },
    originalTitle: String,
    subtitle: String,
    description: String,
    year: Number,
    genres: [String],
    imageUrl: String,
    backdropUrl: String,
    externalId: String,
    creatorNames: [String],
    authorNames: [String],
    runtime: Number,
    pages: Number,
    isbn: String,
    publisher: String,
    language: String,
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },
    deletedAt: Date,
  },
  opts
);
ContentSchema.index({ type: 1, title: 1 });
ContentSchema.index({ genres: 1 });

// Rating Schema
const RatingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    contentId: { type: Schema.Types.ObjectId, ref: 'Content', index: true },
    score: { type: Number, min: 0.5, max: 5 },
  },
  opts
);
RatingSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Review Schema
const ReviewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    contentId: { type: Schema.Types.ObjectId, ref: 'Content', index: true },
    body: { type: String, minlength: 1, maxlength: 10000 },
    spoiler: Boolean,
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    deletedAt: Date,
  },
  opts
);

// Review Like Schema
const ReviewLikeSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    reviewId: Schema.Types.ObjectId,
  },
  opts
);
ReviewLikeSchema.index({ userId: 1, reviewId: 1 }, { unique: true });

// Comment Schema
const CommentSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    reviewId: Schema.Types.ObjectId,
    body: { type: String, maxlength: 2000 },
    deletedAt: Date,
  },
  opts
);

// Generic Relation Schema (Like / Favorite)
const RelSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    contentId: Schema.Types.ObjectId,
  },
  opts
);
RelSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Status Schema
const StatusSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    contentId: Schema.Types.ObjectId,
    status: String,
    progress: Number,
    startedAt: Date,
    completedAt: Date,
  },
  opts
);
StatusSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Follow Schema
const FollowSchema = new Schema(
  {
    followerId: Schema.Types.ObjectId,
    followingId: Schema.Types.ObjectId,
  },
  opts
);
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Custom List Schema
const ListSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    type: { type: String, enum: ['MOVIE', 'BOOK'] },
    name: { type: String, maxlength: 120 },
    description: { type: String, maxlength: 1000 },
    visibility: { type: String, enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'], default: 'PUBLIC' },
    itemCount: { type: Number, default: 0 },
  },
  opts
);

// List Item Schema
const ListItemSchema = new Schema(
  {
    listId: Schema.Types.ObjectId,
    contentId: Schema.Types.ObjectId,
    position: Number,
  },
  opts
);
ListItemSchema.index({ listId: 1, contentId: 1 }, { unique: true });
ListItemSchema.index({ listId: 1, position: 1 });

// Activity Schema
const ActivitySchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    type: String,
    contentId: Schema.Types.ObjectId,
    targetId: Schema.Types.ObjectId,
    metadata: Schema.Types.Mixed,
  },
  opts
);
ActivitySchema.index({ userId: 1, createdAt: -1 });

// Notification Schema
const NotificationSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    actorId: Schema.Types.ObjectId,
    type: String,
    targetId: Schema.Types.ObjectId,
    readAt: Date,
  },
  opts
);
NotificationSchema.index({ userId: 1, createdAt: -1 });

// Report Schema
const ReportSchema = new Schema(
  {
    reporterId: Schema.Types.ObjectId,
    targetType: String,
    targetId: Schema.Types.ObjectId,
    reason: String,
    status: { type: String, enum: ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'], default: 'OPEN' },
    resolvedBy: Schema.Types.ObjectId,
    resolution: String,
  },
  opts
);

// Refresh Token Schema
const RefreshSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    tokenHash: String,
    expiresAt: Date,
    revokedAt: Date,
  },
  opts
);
RefreshSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const User = models.User || model('User', UserSchema);
export const Content = models.Content || model('Content', ContentSchema);
export const Rating = models.Rating || model('Rating', RatingSchema);
export const Review = models.Review || model('Review', ReviewSchema);
export const ReviewLike = models.ReviewLike || model('ReviewLike', ReviewLikeSchema);
export const Comment = models.Comment || model('Comment', CommentSchema);
export const Like = models.Like || model('Like', RelSchema);
export const Favorite = models.Favorite || model('Favorite', RelSchema);
export const Status = models.Status || model('Status', StatusSchema);
export const Follow = models.Follow || model('Follow', FollowSchema);
export const List = models.List || model('List', ListSchema);
export const ListItem = models.ListItem || model('ListItem', ListItemSchema);
export const Activity = models.Activity || model('Activity', ActivitySchema);
export const Notification = models.Notification || model('Notification', NotificationSchema);
export const Report = models.Report || model('Report', ReportSchema);
export const RefreshToken = models.RefreshToken || model('RefreshToken', RefreshSchema);
