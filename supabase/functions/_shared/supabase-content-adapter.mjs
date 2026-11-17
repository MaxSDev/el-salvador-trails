export function supabaseContentAdapter(client) {
  const checked = async promise => { const { data, error } = await promise; if (error) throw new Error(error.message); return data; };
  return {
    store: {
      isAdmin: async id => !!await checked(client.from('content_admins').select('user_id').eq('user_id', id).maybeSingle()),
      list: () => checked(client.from('content_documents').select('id,kind,draft,published,status,version,updated_at').order('id').limit(201)),
      media: () => checked(client.from('content_media').select('path,url,created_at').order('created_at', { ascending: false }).limit(100)),
      addMedia: (actor, item) => checked(client.from('content_media').insert({ ...item, created_by: actor })),
      write: (actor, input) => checked(client.rpc('write_site_content', { p_actor: actor, p_id: input.id, p_kind: input.kind, p_draft: input.draft, p_action: input.action, p_version: input.version }))
    },
    storage: {
      upload: (path, bytes, mime) => checked(client.storage.from('site-media').upload(path, bytes, { contentType: mime, upsert: false, cacheControl: '31536000' })),
      remove: paths => checked(client.storage.from('site-media').remove(paths)),
      publicUrl: path => client.storage.from('site-media').getPublicUrl(path).data.publicUrl
    },
    auth: { user: async token => (await checked(client.auth.getUser(token))).user }
  };
}
