
export const convertTypes = (data:any) =>{
    let query ={};
    for (const key in data){
        if(data[key] === 'false' || data[key] === 'true'){
            query = { ...query, [key]: data[key] === 'false' ? false : true };
        }else if(key === 'hrId' || key === 'action'){
            query = { ...query, [key]: data[key] };
        }else if(data[key] === 'null'){
            query = { ...query, [key]: null };
        }else{
            query = { ...query, [key]: Number(data[key]) };
        }
    }
    return query;
}