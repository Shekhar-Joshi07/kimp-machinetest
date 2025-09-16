import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongo';
import Role from '@/lib/models/Role';
import Permission from '@/lib/models/Permission';
import Assignment from '@/lib/models/Assignment';

export async function GET() {
  try {
    await connectDB();
    
    const roleCount = await Role.countDocuments();
    const permissionCount = await Permission.countDocuments();
    
    if (roleCount === 0 || permissionCount === 0) {
      await Role.deleteMany({});
      await Permission.deleteMany({});
      await Assignment.deleteMany({});
      
      const roles = await Role.insertMany([
        { name: 'Admin', description: 'Full system access' },
        { name: 'Manager', description: 'Management level access' },
        { name: 'Analyst', description: 'Read-only analyst access' }
      ]);
      
      const permissions = await Permission.insertMany([
        { name: 'leads.read', description: 'Read leads data' },
        { name: 'leads.write', description: 'Write leads data' },
        { name: 'deals.read', description: 'Read deals data' },
        { name: 'deals.write', description: 'Write deals data' },
        { name: 'templates.manage', description: 'Manage templates' },
        { name: 'users.manage', description: 'Manage users' },
        { name: 'billing.read', description: 'Read billing data' },
        { name: 'billing.write', description: 'Write billing data' }
      ]);
      
      const adminRole = roles.find(r => r.name === 'Admin');
      const managerRole = roles.find(r => r.name === 'Manager');
      const analystRole = roles.find(r => r.name === 'Analyst');
      
      const assignments = [];
      
      permissions.forEach(permission => {
        assignments.push({ roleId: adminRole._id, permissionId: permission._id, granted: true });
        
        if (permission.name !== 'users.manage' && permission.name !== 'billing.write') {
          assignments.push({ roleId: managerRole._id, permissionId: permission._id, granted: true });
        }
        
        if (permission.name.endsWith('.read')) {
          assignments.push({ roleId: analystRole._id, permissionId: permission._id, granted: true });
        }
      });
      
      await Assignment.insertMany(assignments);
      
      return NextResponse.json({ 
        initialized: true,
        roles: roles.length,
        permissions: permissions.length,
        assignments: assignments.length
      });
    }
    
    return NextResponse.json({ 
      initialized: false,
      message: 'Database already has data'
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Failed to initialize', details: error.message }, { status: 500 });
  }
}