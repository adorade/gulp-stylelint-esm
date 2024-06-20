import gulp from 'gulp';
import gulp5 from 'gulp5';
export default process.env.GULP_5 === '1' ? gulp5 : gulp;
