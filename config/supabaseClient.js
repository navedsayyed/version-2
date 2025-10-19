import { createClient } from '@supabase/supabase-js';
import { getDepartmentForComplaintType, getHODIdForDepartment } from '../utils/departmentMapping';

// Supabase Configuration - Project: version-2
const SUPABASE_URL = 'https://oeazkkxhvmmthysjdklk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lYXpra3hodm1tdGh5c2pka2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MzM3MDksImV4cCI6MjA3NTMwOTcwOX0.8E-2rFABzgK9bRahrC-Rum24l71SPTo8RQj6mAwywJU';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Helper Functions
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (error) {
    return { user: null, error };
  }
};

// User Profile Functions
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const createUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: profileData.email,
        full_name: profileData.full_name || '',
        role: profileData.role || 'user',
      }])
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Complaint Functions
export const createComplaint = async (complaintData) => {
  try {
    // Automatically determine department based on complaint type
    const department = getDepartmentForComplaintType(complaintData.type);
    
    // Try to get HOD ID (will be null if no HOD exists yet)
    const hodId = await getHODIdForDepartment(department, supabase);
    
    // Enhance complaint data with department mapping
    const enhancedComplaintData = {
      ...complaintData,
      complaint_type: department, // Store the department name for HOD filtering
      // Note: assigned_to will be set later when HOD assigns to a technician
    };

    console.log('Creating complaint:', {
      type: complaintData.type,
      mappedDepartment: department,
      hodId: hodId || 'No HOD found (will be assigned later)',
    });

    const { data, error } = await supabase
      .from('complaints')
      .insert([enhancedComplaintData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Error in createComplaint:', error);
    return { data: null, error };
  }
};

export const getComplaints = async (userId, status = null) => {
  try {
    let query = supabase
      .from('complaints')
      .select(`
        *,
        complaint_images(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateComplaintStatus = async (complaintId, status) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .update({ status })
      .eq('id', complaintId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Complete a complaint with photo and notes
export const completeComplaint = async (complaintId, completionData) => {
  try {
    console.log('completeComplaint called with:', { complaintId, completionData });

    const updateData = {
      status: 'completed',
      completed_at: new Date().toISOString(),
    };

    // Add optional fields only if columns exist
    if (completionData.notes) {
      updateData.completion_notes = completionData.notes;
    }
    if (completionData.imageUrl) {
      updateData.completion_image_url = completionData.imageUrl;
      updateData.completion_image_path = completionData.imagePath;
    }

    console.log('Update data:', updateData);
    console.log('Updating complaint ID:', complaintId);

    // Don't use .single() - it fails if 0 rows returned
    const { data, error } = await supabase
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId)
      .select();

    console.log('Update result:', { data, error });

    // Check if update succeeded
    if (error) {
      console.error('Supabase update error:', error);
      return { data: null, error };
    }

    if (!data || data.length === 0) {
      console.error('No rows updated - complaint might not exist or RLS blocking');
      return { 
        data: null, 
        error: { message: 'Failed to update complaint. It may not exist or you may not have permission.' }
      };
    }

    return { data: data[0], error: null };
  } catch (error) {
    console.error('Exception in completeComplaint:', error);
    return { data: null, error };
  }
};

// Upload completion photo (after photo)
export const uploadCompletionImage = async (complaintId, imageUri) => {
  try {
    console.log('Uploading completion image for complaint:', complaintId);

    // Generate unique filename
    const fileExt = imageUri.split('.').pop().split('?')[0] || 'jpg';
    const fileName = `completed_${complaintId}_${Date.now()}.${fileExt}`;
    const filePath = `complaints/${fileName}`;

    // Convert the image to array buffer
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('complaint-images')
      .upload(filePath, uint8Array, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(filePath);

    console.log('Completion image uploaded:', urlData.publicUrl);

    return {
      data: {
        url: urlData.publicUrl,
        path: filePath,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error uploading completion image:', error);
    return { data: null, error };
  }
};

// Get ALL complaints (for technicians/admins)
export const getAllComplaints = async (status = null) => {
  try {
    console.log('📞 getAllComplaints called with status:', status);
    
    let query = supabase
      .from('complaints')
      .select(`
        *,
        complaint_images(*),
        users!complaints_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      console.log('🔍 Adding status filter:', status);
      query = query.eq('status', status);
    } else {
      console.log('🔍 No status filter - getting ALL complaints');
    }

    console.log('🚀 Executing Supabase query...');
    const { data, error } = await query;
    
    console.log('📦 Supabase response:');
    console.log('  - Data:', JSON.stringify(data, null, 2));
    console.log('  - Error:', error);
    console.log('  - Data count:', data?.length || 0);
    
    return { data, error };
  } catch (error) {
    console.error('💥 Exception in getAllComplaints:', error);
    return { data: null, error };
  }
};

// Storage Functions for Images
export const uploadComplaintImage = async (complaintId, imageUri) => {
  try {
    // Debug: get current authenticated user
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) console.warn('supabase.auth.getUser error:', authError);
      console.log('Uploading image - current user:', authData?.user?.id);
    } catch (e) {
      console.warn('Could not fetch auth user before upload:', e);
    }

    // Generate unique filename
    const fileExt = imageUri.split('.').pop().split('?')[0] || 'jpg';
    const fileName = `${complaintId}_${Date.now()}.${fileExt}`;
    const filePath = `complaints/${fileName}`;

    // Convert the image to array buffer for Supabase
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage using array buffer
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('complaint-images')
      .upload(filePath, uint8Array, {
        contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
        cacheControl: '3600',
        upsert: false,
      });

    // Debug upload result
    console.log('Storage upload result:', { uploadData, uploadError });

    if (uploadError) {
      console.error('Upload error (storage):', uploadError);
      throw { stage: 'storage', error: uploadError };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('complaint-images')
      .getPublicUrl(filePath);

    // Insert image record into complaint_images table
    const { data: imageRecord, error: imageError } = await supabase
      .from('complaint_images')
      .insert([{
        complaint_id: complaintId,
        url: urlData.publicUrl,
        storage_path: filePath,
      }])
      .select()
      .single();

    if (imageError) {
      console.error('Image record error (db insert):', imageError);
      throw { stage: 'db', error: imageError };
    }

    return { data: imageRecord, error: null };
  } catch (error) {
    console.error('Error uploading image (final):', error);
    return { data: null, error };
  }
};

export const deleteComplaintImage = async (imagePath) => {
  try {
    const { error } = await supabase.storage
      .from('complaint-images')
      .remove([imagePath]);
    return { error };
  } catch (error) {
    return { error };
  }
};

export default supabase;
