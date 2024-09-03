use anchor_lang::prelude::*;

declare_id!("AjGddYSymQFXUrKjahjAqhemd7Epy7X74qDtDXH7ge2d");

#[program]
pub mod student_intro_program {
   

    use super::*;
    pub fn create_account(ctx:Context<CreateStudent>,name:String,short_message:String)->Result<()>{
        let student_account = &mut ctx.accounts.student_account;
        student_account.id = ctx.accounts.student.key();
        student_account.name = name;
        student_account.short_message = short_message;
        Ok(())
    }
    pub fn update_account(ctx:Context<UpdateStudent>,name:String,short_message:String)->Result<()>{
        let student_account = &mut ctx.accounts.student_account;
        student_account.name = name;
        student_account.short_message = short_message;
        Ok(())
    }
    pub fn delete_account(_ctx:Context<DeleteStudent>,_name:String)->Result<()>{
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name:String,short_message:String)]
pub struct CreateStudent<'info>{
    #[account(
        init,
        payer = student,
        seeds = [name.as_bytes(),student.key().as_ref()],
        bump,
        space = Student::INIT_SPACE + name.len() + short_message.len()
    )]
    pub student_account:Account<'info,Student>,
    #[account(mut)]
    pub student:Signer<'info>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
#[instruction(name:String,short_message:String)]
pub struct UpdateStudent<'info>{
    #[account(
        mut,seeds = [name.as_bytes(),student.key().as_ref()],
        bump,
        realloc = Student::INIT_SPACE + name.len() + short_message.len(),
        realloc::payer = student,
        realloc::zero=true,
    )]
    pub student_account:Account<'info,Student>,
    #[account(mut)]
    pub student:Signer<'info>,
    pub system_program:Program<'info,System>
}

#[derive(Accounts)]
#[instruction(name:String)]
pub struct DeleteStudent<'info>{
    #[account(
        mut,
        seeds= [name.as_bytes(),student.key().as_ref()],
        bump,
        close = student
    )]
    pub student_account:Account<'info,Student>,
    #[account(mut)]
    pub student:Signer<'info>,
    pub system_program:Program<'info,System>
}


#[account]
pub struct Student{
    pub id:Pubkey,
    pub name:String,
    pub short_message:String,
}

impl Space for Student{
    const INIT_SPACE: usize = 8 + 32 + 4 + 4;
}