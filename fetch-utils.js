const SUPABASE_URL = 'https://ogfxwdqfdtaaoiuiclsh.supabase.co';
const SUPABASE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nZnh3ZHFmZHRhYW9pdWljbHNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjgxMDgwNjIsImV4cCI6MTk4MzY4NDA2Mn0.5JRX_e27xoEYI26VTDundVtD05vASo1z964M0KcbMNc';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* Auth related functions */

export function getUser() {
    return client.auth.user();
}

export async function signUpUser(email, password) {
    return await client.auth.signUp({
        email,
        password,
    });
}

export async function signInUser(email, password) {
    return await client.auth.signIn({
        email,
        password,
    });
}

export async function signOutUser() {
    return await client.auth.signOut();
}

/* Data functions */

//upsertProfile
export async function upsertProfile(profile) {
    const response = await client
        .from('profiles')
        .upsert(profile, { onConflict: 'user_id' })
        .single();

    return checkError(response);
}

//uploadImage
export async function uploadImage(imagePath, imageFile) {
    // use the storage bucket to upload the image to and then use it to get the public URL
    const bucket = client.storage.from('avatars');

    const response = await bucket.upload(imagePath, imageFile, {
        cacheControl: '3600',
        // we want to replace and existing file with same name
        upsert: true,
    });

    if (response.error) {
        return null;
    }
    // construct the url to the image
    const url = `${SUPABASE_URL}/storage/v1/object/public/${response.data.Key}`;

    return url;
}

export async function getProfile(user_id) {
    const response = await client.from('profiles').select('*').match({ user_id }).maybeSingle();
    // ({ user_id }) = ({user_id : user_id})
    return response;
}

export async function getProfileById(id) {
    const response = await client.from('profiles').select('*, messages(*)').match({ id }).single();
    return checkError(response);
}

export async function getProfiles() {
    const response = await client.from('profiles').select();
    return checkError(response);
}

export async function incrementStars(id) {
    const profile = await getProfileById(id);

    const response = await client
        .from('profiles')
        .update({ stars: profile.stars + 1 })
        .match({ id });

    return checkError(response);
}
export async function decrementStars(id) {
    const profile = await getProfileById(id);

    const response = await client
        .from('profiles')
        .update({ stars: profile.stars - 1 })
        .match({ id });

    return checkError(response);
}

export async function createMessage(message) {
    const response = await client.from('messages').insert(message).single();
    return checkError(response);
}

function checkError(response) {
    return response.error ? console.error(response.error) : response.data;
}
