import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Role from '@/lib/models/Role';
import Permission from '@/lib/models/Permission';
import Assignment from '@/lib/models/Assignment';

export async function POST() {
  try {
    await connectDB();
    
    await Role.deleteMany({});
    await Permission.deleteMany({});
    await Assignment.deleteMany({});
    
    const roles = await Role.insertMany([
      { name: 'Admin', description: 'Full system access' },
      { name: 'Editor', description: 'Content management access' },
      { name: 'Viewer', description: 'Read-only access' },
      { name: 'Moderator', description: 'Content moderation access' },
      { name: 'Manager', description: 'Team management access' }
    ]);
    
    const permissions = await Permission.insertMany([
      { name: 'users.read', description: 'View users', group: 'Users' },
      { name: 'users.write', description: 'Create and edit users', group: 'Users' },
      { name: 'users.delete', description: 'Delete users', group: 'Users' },
      { name: 'posts.read', description: 'View posts', group: 'Content' },
      { name: 'posts.write', description: 'Create and edit posts', group: 'Content' },
      { name: 'posts.delete', description: 'Delete posts', group: 'Content' },
      { name: 'comments.read', description: 'View comments', group: 'Content' },
      { name: 'comments.write', description: 'Create and edit comments', group: 'Content' },
      { name: 'comments.delete', description: 'Delete comments', group: 'Content' },
      { name: 'settings.read', description: 'View system settings', group: 'System' },
      { name: 'settings.write', description: 'Modify system settings', group: 'System' },
      { name: 'reports.read', description: 'View reports', group: 'Analytics' },
      { name: 'reports.write', description: 'Create reports', group: 'Analytics' }
    ]);
    
    const assignments = [];
    
    const adminRole = roles.find(r => r.name === 'Admin');
    const editorRole = roles.find(r => r.name === 'Editor');
    const viewerRole = roles.find(r => r.name === 'Viewer');
    const moderatorRole = roles.find(r => r.name === 'Moderator');
    const managerRole = roles.find(r => r.name === 'Manager');
    
    permissions.forEach(permission => {
      assignments.push({
        roleId: adminRole._id,
        permissionId: permission._id,
        granted: true
      });
    });
    
    permissions.filter(p => p.name.includes('read') || (p.name.includes('write') && p.group === 'Content')).forEach(permission => {
      assignments.push({
        roleId: editorRole._id,
        permissionId: permission._id,
        granted: true
      });
    });
    
    permissions.filter(p => p.name.includes('read')).forEach(permission => {
      assignments.push({
        roleId: viewerRole._id,
        permissionId: permission._id,
        granted: true
      });
    });
    
    permissions.filter(p => p.group === 'Content').forEach(permission => {
      assignments.push({
        roleId: moderatorRole._id,
        permissionId: permission._id,
        granted: true
      });
    });
    
    permissions.filter(p => p.name.includes('read') || p.group === 'Users').forEach(permission => {
      assignments.push({
        roleId: managerRole._id,
        permissionId: permission._id,
        granted: true
      });
    });
    
    await Assignment.insertMany(assignments);
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        roles: roles.length,
        permissions: permissions.length,
        assignments: assignments.length
      }
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed the database',
    endpoint: 'POST /api/seed'
  });
}