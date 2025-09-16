
import { NextRequest, NextResponse } from "next/server";

import connectDB from "../../../lib/mongo";

import Role from "@/lib/models/Role";

export async function GET(){
    try {
        await connectDB();
        const roles = await Role.find({}).sort({name: 1});
        return NextResponse.json(roles);
    } catch (error) {
        console.error('Error fetching roles', error);
        return NextResponse.json(
            {error: "Failed to fetch roles", details: error.message},
            {status: 500}
        )
    }
}

export async function POST(request){
    try {
   await connectDB(); 
   const { name, description } = await request.json();
   const role = new Role({name, description});
   await role.save();
   return NextResponse.json(role, {status: 201})
    } catch (error) {
        console.error('Error creating roles', error);
        return NextResponse.json(
            {error: "Failed to create roles"},
            {status: 500}
        )
    } 
    
}