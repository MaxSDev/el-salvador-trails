export function supabaseReviewAdapter(client) {
  const checked = async promise => { const { data, error } = await promise; if (error) throw new Error(error.message); return data; };
  const fields = 'id,author_name,country,rating,body,lang,tour_slug,status,moderation_reasons,created_at,published_at,reviewed_at,version,review_photos(storage_path,position)';
  async function list(status, { offset, limit }) {
    const rows = await checked(client.from('reviews').select(fields).eq('status', status).order(status === 'approved' ? 'published_at' : 'created_at', { ascending: false }).order('id').range(offset, offset + limit));
    return { rows: rows.slice(0, limit), hasMore: rows.length > limit };
  }
  return {
    store: {
      consumeRate: key => checked(client.rpc('consume_review_rate_limit', { p_key: key })),
      settings: () => checked(client.from('review_settings').select('manual_only').eq('singleton', true).single()),
      findSubmission: id => checked(client.from('reviews').select('id,status,payload_hash').eq('submission_id', id).maybeSingle()),
      createReview: (review, photos) => checked(client.rpc('create_guest_review', { p_review: review, p_photos: photos })),
      listPublic: options => list('approved', options),
      listAdmin: options => list(options.status, options),
      isAdmin: async id => !!await checked(client.from('review_admins').select('user_id').eq('user_id', id).maybeSingle()),
      moderateReview: (actor, id, status, version) => checked(client.rpc('moderate_guest_review', { p_actor: actor, p_id: id, p_status: status, p_version: version })),
      deleteReview: (actor, id, version) => checked(client.rpc('delete_guest_review', { p_actor: actor, p_id: id, p_version: version })),
      pendingPhotoDeletions: () => checked(client.from('review_photo_deletions').select('review_id,storage_paths').order('created_at').limit(13)),
      completePhotoDeletion: id => checked(client.from('review_photo_deletions').delete().eq('review_id', id)),
      setManualMode: (actor, manual) => checked(client.rpc('set_review_manual_mode', { p_actor: actor, p_manual: manual }))
    },
    storage: {
      upload: (path, bytes, mime) => checked(client.storage.from('review-photos').upload(path, bytes, { contentType: mime, upsert: false, cacheControl: '300' })),
      remove: paths => checked(client.storage.from('review-photos').remove(paths)),
      signedUrl: async path => (await checked(client.storage.from('review-photos').createSignedUrl(path, 300))).signedUrl
    },
    auth: { user: async token => (await checked(client.auth.getUser(token))).user }
  };
}
